package com.example.sample;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.greaterThanOrEqualTo;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.httpBasic;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class SampleApplicationTests {
    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("Basic auth, sample item CRUD API flow works")
    void sampleItemCrudFlow() throws Exception {
        var auth = httpBasic("root", "root");
        var payload = """
                {
                  "title": "통합 테스트",
                  "description": "MockMvc로 CRUD 흐름을 검증합니다.",
                  "status": "TODO"
                }
                """;

        mockMvc.perform(get("/api/auth/me").with(auth))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.username").value("root"));

        mockMvc.perform(get("/api/sample-items").with(auth))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()", greaterThanOrEqualTo(2)));

        var created = mockMvc.perform(post("/api/sample-items")
                        .with(auth)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.title").value("통합 테스트"))
                .andExpect(jsonPath("$.data.status").value("TODO"))
                .andReturn();

        var id = JsonPathUtils.readLong(created.getResponse().getContentAsString(), "$.data.id");

        mockMvc.perform(put("/api/sample-items/{id}", id)
                        .with(auth)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "title": "통합 테스트 수정",
                                  "description": "수정 API를 검증합니다.",
                                  "status": "DONE"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.title").value("통합 테스트 수정"))
                .andExpect(jsonPath("$.data.status").value("DONE"));

        mockMvc.perform(delete("/api/sample-items/{id}", id).with(auth))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.id").value(id));
    }

    private static class JsonPathUtils {
        private JsonPathUtils() {
        }

        static long readLong(String json, String path) {
            return com.jayway.jsonpath.JsonPath.parse(json).read(path, Number.class).longValue();
        }
    }
}
