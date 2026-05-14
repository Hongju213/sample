package com.example.sample.agent.controller;

import com.example.sample.common.CommonResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestClient;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Tag(name = "AgentTest", description = "Local Agent callback 테스트 API")
@RestController
@RequestMapping("/api/agent-test")
public class AgentTestController extends CommonResponse {

    /*
     * 이 컨트롤러는 "업무 실행"을 직접 하지 않습니다.
     *
     * 역할 분리:
     * - sample backend: 요청 상태(requested/completed)를 저장하고 화면에 알려줌
     * - local agent: Windows 배치 파일을 실행하고 완료 결과를 sample로 전달함
     * - C:\Projects\test.bat: Python runner(run-pack.py)를 호출함
     * - run-pack.py/router: 실제 업무를 수행한 뒤 agent 완료 API를 호출함
     *
     * 현재 jobs는 테스트용 인메모리 저장소입니다.
     * 서버 재시작 시 사라지므로, 운영에서는 DB 테이블 또는 메시지 저장소로 교체하면 됩니다.
     */
    private final RestClient agentClient;
    private final Map<String, AgentJobStatus> jobs = new ConcurrentHashMap<>();

    public AgentTestController(RestClient.Builder restClientBuilder) {
        this.agentClient = restClientBuilder
                .baseUrl("http://127.0.0.1:8000")
                .build();
    }

    @Operation(summary = "Local Agent GET 배치 요청 테스트")
    @GetMapping("/bat")
    public ResponseEntity<Map<String, Object>> requestAgentBatchByGet() {
        /*
         * 입력: 별도 body 없이 sample이 만든 query parameter만 agent로 전달합니다.
         * 출력: agent가 즉시 반환하는 accepted/message/job_id JSON입니다.
         */
        Map<String, Object> response = agentClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/api/bat/test")
                        .queryParam("source", "sample")
                        .queryParam("message", "GET 요청 테스트")
                        .build())
                .retrieve()
                .body(Map.class);

        rememberRequestedJob(response, "GET");
        return success(response);
    }

    @Operation(summary = "Local Agent POST 배치 요청 테스트")
    @PostMapping("/bat")
    public ResponseEntity<Map<String, Object>> requestAgentBatchByPost(
            @RequestBody(required = false) Map<String, Object> body) {
        /*
         * 입력: 화면 또는 API 클라이언트가 보낸 JSON body입니다.
         * body가 없으면 테스트용 기본 payload를 만들어 agent에 전달합니다.
         */
        Map<String, Object> requestBody = body;
        if (requestBody == null) {
            requestBody = new LinkedHashMap<>();
            requestBody.put("source", "sample");
            requestBody.put("message", "POST 요청 테스트");
        }

        Map<String, Object> response = agentClient.post()
                .uri("/api/bat/test")
                .body(requestBody)
                .retrieve()
                .body(Map.class);

        rememberRequestedJob(response, "POST");
        return success(response);
    }

    @Operation(summary = "Local Agent 완료 콜백 수신")
    @PostMapping("/callback")
    public ResponseEntity<AgentJobStatus> receiveAgentCallback(@RequestBody Map<String, Object> payload) {
        /*
         * 입력: agent가 전달한 최종 완료 payload입니다.
         * 주요 필드:
         * - job_id: 요청과 완료를 연결하는 ID
         * - method/body/query: 최초 요청 정보
         * - python_runner/pack/tasks/result: Python 업무 결과 정보
         *
         * 출력: 화면이 조회할 수 있는 AgentJobStatus 형태로 저장 후 반환합니다.
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
        return success(status);
    }

    @Operation(summary = "Local Agent 최근 작업 상태 조회")
    @GetMapping("/status")
    public ResponseEntity<AgentJobStatus> getLastStatus() {
        /*
         * 화면은 이 API를 폴링합니다.
         * requested 상태일 때는 "요청되었습니다.", completed 상태가 되면 "완료되었습니다."를 보여줍니다.
         */
        return success(jobs.values().stream()
                .max((left, right) -> left.updatedAt().compareTo(right.updatedAt()))
                .orElse(AgentJobStatus.idle()));
    }

    private void rememberRequestedJob(Map response, String method) {
        /*
         * agent가 즉시 반환한 job_id를 저장합니다.
         * 이 저장값은 나중에 /callback이 같은 job_id를 completed로 덮어쓰면서 완료 상태가 됩니다.
         */
        if (response == null || response.get("job_id") == null) {
            return;
        }

        String jobId = String.valueOf(response.get("job_id"));
        jobs.put(jobId, new AgentJobStatus(
                jobId,
                "requested",
                "요청되었습니다.",
                method,
                response,
                LocalDateTime.now()
        ));
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
         * 아직 요청이 한 번도 없을 때 화면에 반환하는 기본 상태입니다.
         */
        static AgentJobStatus idle() {
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
