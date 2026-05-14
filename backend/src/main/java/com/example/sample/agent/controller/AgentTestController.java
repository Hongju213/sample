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

    private final RestClient agentClient;
    private final Map<String, AgentJobStatus> jobs = new ConcurrentHashMap<>();
    private final List<SseEmitter> emitters = new CopyOnWriteArrayList<>();

    public AgentTestController(RestClient.Builder restClientBuilder) {
        this.agentClient = restClientBuilder
                .baseUrl("http://127.0.0.1:8000")
                .build();
    }

    @Operation(summary = "Request local agent batch by GET")
    @GetMapping("/bat")
    public ResponseEntity<Map<String, Object>> requestAgentBatchByGet() {
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
        SseEmitter emitter = new SseEmitter(30L * 60L * 1000L);
        emitters.add(emitter);

        emitter.onCompletion(() -> emitters.remove(emitter));
        emitter.onTimeout(() -> emitters.remove(emitter));
        emitter.onError(error -> emitters.remove(emitter));

        try {
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
        return success(getLatestStatus());
    }

    private void rememberRequestedJob(Map response, String method) {
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
        return jobs.values().stream()
                .max((left, right) -> left.updatedAt().compareTo(right.updatedAt()))
                .orElse(AgentJobStatus.idle());
    }

    private void broadcastStatus(AgentJobStatus status) {
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
