package com.example.sample.agent.controller;

import com.example.sample.common.CommonResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestClient;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

@Tag(name = "AgentTest", description = "Local Agent callback test API")
@RestController
@RequestMapping("/api/agent-test")
public class AgentTestController extends CommonResponse {

    /*
     * agentClient
     * -------------------------------------------------------------------------
     * sample backend가 local agent에게 HTTP 요청을 보낼 때 사용하는 client입니다.
     *
     * 화면(frontend)은 local agent를 직접 호출하지 않습니다.
     * 화면 -> sample backend -> local agent 순서로 호출합니다.
     *
     * 이렇게 중간에 sample backend를 두면 다음 장점이 있습니다.
     * - 화면은 agent의 실제 주소, 포트, 인증 방식, 실행 여부를 몰라도 됩니다.
     * - agent 요청/응답을 backend에서 기록하거나 DB 상태로 관리하기 쉽습니다.
     * - 나중에 local agent가 아닌 다른 실행기로 바뀌어도 화면 코드는 덜 흔들립니다.
     */
    private final RestClient agentClient;

    /*
     * jobs
     * -------------------------------------------------------------------------
     * agent 작업 상태를 임시로 저장하는 인메모리 저장소입니다.
     *
     * key:
     * - agent가 접수 응답으로 돌려준 job_id
     *
     * value:
     * - 화면에 보여줄 AgentJobStatus
     *
     * 상태 변화:
     * - /bat 요청 직후: requested
     * - /callback 수신 후: completed
     *
     * 지금은 테스트 목적이라 메모리를 사용합니다.
     * 운영에서는 서버 재시작에도 상태가 유지되도록 DB, Redis, 메시지 저장소 등으로
     * 바꾸는 것이 좋습니다.
     */
    private final Map<String, AgentJobStatus> jobs = new ConcurrentHashMap<>();

    /*
     * emitters
     * -------------------------------------------------------------------------
     * 현재 /events SSE endpoint에 연결되어 있는 브라우저 목록입니다.
     *
     * SseEmitter 하나는 "열려 있는 브라우저 탭 하나와 backend 사이의 이벤트 연결"이라고
     * 이해하면 됩니다.
     *
     * CopyOnWriteArrayList를 사용하는 이유:
     * - 어떤 사용자는 화면을 열고,
     * - 어떤 사용자는 화면을 닫고,
     * - 동시에 callback thread는 이벤트를 broadcast할 수 있습니다.
     *
     * 일반 ArrayList를 쓰면 순회 중 목록이 바뀌어서 ConcurrentModificationException이
     * 날 수 있습니다. CopyOnWriteArrayList는 이런 읽기 위주 목록에 안전합니다.
     */
    private final List<SseEmitter> emitters = new CopyOnWriteArrayList<>();

    public AgentTestController(RestClient.Builder restClientBuilder) {
        /*
         * RestClient.Builder는 Spring이 주입해주는 HTTP client builder입니다.
         *
         * baseUrl:
         * - 아래 agentClient.get().uri("/api/bat/test") 같은 호출의 공통 앞부분입니다.
         * - 실제 호출 주소는 http://127.0.0.1:8000/api/bat/test 가 됩니다.
         *
         * 내부망이나 운영 환경에서 local agent 주소가 달라진다면 이 값도 설정화하는 것이 좋습니다.
         */
        this.agentClient = restClientBuilder
                .baseUrl("http://127.0.0.1:8000")
                .build();
    }

    @Operation(summary = "Request local agent batch by GET")
    @GetMapping("/bat")
    public ResponseEntity<Map<String, Object>> requestAgentBatchByGet() {
        /*
         * 역할:
         * - 화면의 GET 테스트 버튼 요청을 받습니다.
         * - sample backend가 local agent의 GET /api/bat/test를 대신 호출합니다.
         *
         * 입력:
         * - 화면 -> sample backend 요청에는 별도 body가 없습니다.
         * - agent로 넘기는 source/message는 테스트 확인용 query parameter입니다.
         *
         * 출력:
         * - agent가 즉시 반환한 접수 응답을 화면에 돌려줍니다.
         * - 이 응답은 "작업이 끝났다"가 아니라 "agent가 요청을 접수했다"는 뜻입니다.
         *
         * 이후 완료 흐름:
         * - agent가 bat/python 작업을 끝내면 /callback으로 완료 결과를 보내옵니다.
         * - /callback은 상태를 completed로 저장하고 SSE로 화면에 push합니다.
         */
        Map<String, Object> response = agentClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/api/bat/test")
                        .queryParam("source", "sample")
                        .queryParam("message", "GET request test")
                        .build())
                .retrieve()
                .body(Map.class);

        rememberRequestedJob(response, "GET");
        return success(response);
    }

    @Operation(summary = "Request local agent batch by POST")
    @PostMapping("/bat")
    public ResponseEntity<Map<String, Object>> requestAgentBatchByPost(
            @RequestBody(required = false) Map<String, Object> body) {
        /*
         * 역할:
         * - 화면의 POST 테스트 버튼 요청을 받습니다.
         * - sample backend가 local agent의 POST /api/bat/test를 대신 호출합니다.
         *
         * 파라미터:
         * - body: 화면이 보낸 자유 형식 JSON입니다.
         * - required = false 이므로 body 없이 호출해도 됩니다.
         *
         * 처리:
         * - body가 없으면 테스트용 기본 payload를 만들어 agent에 보냅니다.
         * - agent는 이 값을 INPUT_JSON 환경변수로 test.bat/run-pack.py에 전달합니다.
         *
         * 출력:
         * - GET과 동일하게 agent의 즉시 접수 응답을 반환합니다.
         */
        Map<String, Object> requestBody = body;
        if (requestBody == null) {
            requestBody = new LinkedHashMap<>();
            requestBody.put("source", "sample");
            requestBody.put("message", "POST request test");
        }

        Map<String, Object> response = agentClient.post()
                .uri("/api/bat/test")
                .body(requestBody)
                .retrieve()
                .body(Map.class);

        rememberRequestedJob(response, "POST");
        return success(response);
    }

    @Operation(summary = "Receive local agent completion callback")
    @PostMapping("/callback")
    public ResponseEntity<AgentJobStatus> receiveAgentCallback(@RequestBody Map<String, Object> payload) {
        /*
         * 역할:
         * - local agent가 bat/python 작업 완료 후 호출하는 callback API입니다.
         *
         * 입력 payload 주요 필드:
         * - job_id: 최초 요청과 완료 결과를 연결하는 작업 ID
         * - method: 최초 요청 방식(GET/POST)
         * - query/body: 최초 요청에서 agent로 전달된 값
         * - python_runner: 실행된 Python entrypoint 이름
         * - pack/tasks: Python runner가 읽은 pack 정보와 수행 task 목록
         * - result: Python 업무 결과
         *
         * 처리:
         * - job_id 기준으로 작업 상태를 completed로 저장합니다.
         * - 저장 직후 broadcastStatus(status)를 호출합니다.
         * - broadcastStatus는 현재 SSE로 연결된 모든 화면에 완료 상태를 push합니다.
         *
         * 출력:
         * - callback 호출자인 agent에게도 저장된 AgentJobStatus를 JSON으로 반환합니다.
         * - 화면은 이 HTTP 응답을 직접 받지 않습니다.
         * - 화면은 /events SSE 연결을 통해 같은 상태를 전달받습니다.
         */
        String jobId = String.valueOf(payload.get("job_id"));
        AgentJobStatus status = new AgentJobStatus(
                jobId,
                "completed",
                "완료되었습니다.",
                String.valueOf(payload.get("method")),
                payload,
                LocalDateTime.now()
        );
        jobs.put(jobId, status);
        broadcastStatus(status);
        return success(status);
    }

    @Operation(summary = "Subscribe local agent status events")
    @GetMapping(value = "/events", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter subscribeAgentStatus() {
        /*
         * 역할:
         * - 화면이 작업 상태 변경을 실시간으로 받기 위해 연결하는 SSE endpoint입니다.
         *
         * SSE(Server-Sent Events)란:
         * - 브라우저가 HTTP 연결을 하나 열어둡니다.
         * - 서버는 그 연결을 닫지 않고 유지합니다.
         * - 서버에서 일이 생기면 event/data 형식으로 브라우저에 메시지를 밀어줍니다.
         *
         * WebSocket과 다른 점:
         * - SSE는 서버 -> 브라우저 단방향 push에 적합합니다.
         * - 지금 요구사항은 "backend가 완료를 알리면 화면이 받는다"이므로 양방향 통신이 필요 없습니다.
         * - 그래서 WebSocket보다 설정과 코드가 단순합니다.
         *
         * 출력:
         * - Content-Type: text/event-stream
         * - event name: agent-status
         * - data: AgentJobStatus JSON
         */
        SseEmitter emitter = new SseEmitter(30L * 60L * 1000L);
        emitters.add(emitter);

        /*
         * 연결 정리:
         * - 사용자가 탭을 닫거나,
         * - 네트워크가 끊기거나,
         * - timeout이 발생하면 해당 emitter는 더 이상 쓸 수 없습니다.
         *
         * 이런 emitter를 목록에서 제거하지 않으면 죽은 연결에 계속 이벤트를 보내려 하게 됩니다.
         */
        emitter.onCompletion(() -> emitters.remove(emitter));
        emitter.onTimeout(() -> emitters.remove(emitter));
        emitter.onError(error -> emitters.remove(emitter));

        try {
            /*
             * 연결 직후 현재 최신 상태를 한 번 보냅니다.
             *
             * 이유:
             * - 화면을 새로고침했을 때도 현재 상태를 즉시 알 수 있습니다.
             * - 아직 작업이 없으면 idle 상태가 전달됩니다.
             */
            emitter.send(SseEmitter.event()
                    .name("agent-status")
                    .data(getLatestStatus()));
        } catch (IOException e) {
            emitters.remove(emitter);
        }

        return emitter;
    }

    @Operation(summary = "Get latest local agent status")
    @GetMapping("/status")
    public ResponseEntity<AgentJobStatus> getLastStatus() {
        /*
         * 역할:
         * - 현재 backend가 알고 있는 가장 최신 작업 상태를 조회합니다.
         *
         * SSE가 있는데도 이 API가 필요한 이유:
         * - 화면 최초 진입 시 초기 상태 조회용으로 쓸 수 있습니다.
         * - SSE 연결이 막힌 환경에서 fallback 조회 API로 사용할 수 있습니다.
         * - 디버깅할 때 브라우저나 curl로 현재 상태를 빠르게 확인할 수 있습니다.
         */
        return success(getLatestStatus());
    }

    private void rememberRequestedJob(Map response, String method) {
        /*
         * 역할:
         * - agent의 즉시 접수 응답을 requested 상태로 저장합니다.
         *
         * 입력:
         * - response: agent가 반환한 Map입니다.
         *   예: { accepted: true, message: "요청되었습니다.", job_id: "..." }
         * - method: 화면에서 사용한 요청 방식입니다. GET 또는 POST입니다.
         *
         * 처리:
         * - response에 job_id가 없으면 상태 연결이 불가능하므로 아무 것도 하지 않습니다.
         * - job_id가 있으면 requested 상태를 jobs에 저장합니다.
         * - 저장 후 broadcastStatus(status)를 호출해 화면에 "요청되었습니다." 상태를 즉시 보냅니다.
         */
        if (response == null || response.get("job_id") == null) {
            return;
        }

        String jobId = String.valueOf(response.get("job_id"));
        AgentJobStatus status = new AgentJobStatus(
                jobId,
                "requested",
                "요청되었습니다.",
                method,
                response,
                LocalDateTime.now()
        );
        jobs.put(jobId, status);
        broadcastStatus(status);
    }

    private AgentJobStatus getLatestStatus() {
        /*
         * 역할:
         * - jobs에 저장된 상태 중 updatedAt이 가장 늦은 상태를 반환합니다.
         *
         * 출력:
         * - 작업이 있으면 최신 AgentJobStatus
         * - 작업이 없으면 AgentJobStatus.idle()
         */
        return jobs.values().stream()
                .max((left, right) -> left.updatedAt().compareTo(right.updatedAt()))
                .orElse(AgentJobStatus.idle());
    }

    private void broadcastStatus(AgentJobStatus status) {
        /*
         * 역할:
         * - 현재 /events에 연결된 모든 화면에 상태 변경 이벤트를 보냅니다.
         *
         * 전송되는 SSE 메시지 개념:
         * - event: agent-status
         * - data: {"jobId":"...","status":"completed","message":"완료되었습니다.",...}
         *
         * 예외 처리:
         * - IOException은 대개 브라우저 탭 종료, 네트워크 끊김, timeout 등으로 발생합니다.
         * - 실패한 emitter는 더 이상 쓸 수 없으므로 emitters 목록에서 제거합니다.
         */
        for (SseEmitter emitter : emitters) {
            try {
                emitter.send(SseEmitter.event()
                        .name("agent-status")
                        .data(status));
            } catch (IOException e) {
                emitters.remove(emitter);
            }
        }
    }

    public record AgentJobStatus(
            String jobId,
            String status,
            String message,
            String method,
            Map<String, Object> payload,
            LocalDateTime updatedAt
    ) {
        /*
         * AgentJobStatus
         * ---------------------------------------------------------------------
         * 화면과 SSE로 주고받는 작업 상태 DTO입니다.
         *
         * 필드 설명:
         * - jobId:
         *   agent가 발급한 작업 ID입니다. 요청과 완료 callback을 연결합니다.
         *
         * - status:
         *   화면 로직에서 사용하는 상태 구분값입니다.
         *   현재 값은 idle, requested, completed를 사용합니다.
         *
         * - message:
         *   화면에 표시할 사용자 메시지입니다.
         *
         * - method:
         *   최초 요청 방식입니다. GET/POST 테스트 구분에 사용합니다.
         *
         * - payload:
         *   agent 또는 Python runner가 보내온 원본 데이터입니다.
         *   상세 결과 확인, 디버깅, 이후 DB 저장에 활용할 수 있습니다.
         *
         * - updatedAt:
         *   상태가 생성 또는 갱신된 시각입니다.
         *   getLatestStatus()에서 최신 상태를 고를 때 사용합니다.
         */
        static AgentJobStatus idle() {
            /*
             * 아직 어떤 agent 작업도 접수되지 않은 최초 상태입니다.
             */
            return new AgentJobStatus(
                    null,
                    "idle",
                    "대기 중입니다.",
                    null,
                    Map.of(),
                    LocalDateTime.now()
            );
        }
    }
}
