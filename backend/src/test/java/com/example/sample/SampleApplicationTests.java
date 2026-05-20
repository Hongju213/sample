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
    @DisplayName("Basic auth and sample item CRUD API flow works")
    void sampleItemCrudFlow() throws Exception {
        var auth = httpBasic("root", "root");
        var payload = """
                {
                  "title": "Integration test",
                  "description": "MockMvc verifies the CRUD flow.",
                  "status": "TODO"
                }
                """;

        mockMvc.perform(get("/api/auth/me").with(auth))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.username").value("root"));

        mockMvc.perform(get("/api/sample-items").with(auth))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content.length()", greaterThanOrEqualTo(2)));

        var created = mockMvc.perform(post("/api/sample-items")
                        .with(auth)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Integration test"))
                .andExpect(jsonPath("$.status").value("TODO"))
                .andReturn();

        var id = JsonPathUtils.readLong(created.getResponse().getContentAsString(), "$.id");

        mockMvc.perform(put("/api/sample-items/{id}", id)
                        .with(auth)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "title": "Integration test updated",
                                  "description": "Update API verified.",
                                  "status": "DONE"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Integration test updated"))
                .andExpect(jsonPath("$.status").value("DONE"));

        mockMvc.perform(delete("/api/sample-items/{id}", id).with(auth))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(id));
    }

    @Test
    @DisplayName("Tree and grid APIs return database-backed data")
    void treeAndGridApiFlow() throws Exception {
        var auth = httpBasic("root", "root");

        mockMvc.perform(get("/api/tree-nodes").with(auth))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()", greaterThanOrEqualTo(2)))
                .andExpect(jsonPath("$[0].nodeKey").value("aaa"))
                .andExpect(jsonPath("$[0].children.length()", greaterThanOrEqualTo(1)))
                .andExpect(jsonPath("$[0].children[0].nodeKey").value("aaa-1"));

        mockMvc.perform(get("/api/grid-items")
                        .with(auth)
                        .param("nodeKey", "aaa-1-1")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content.length()", greaterThanOrEqualTo(2)))
                .andExpect(jsonPath("$.content[0].nodeKey").value("aaa-1-1"))
                .andExpect(jsonPath("$.content[0].col1").value("aaa-1-1-col1-001"));

        mockMvc.perform(get("/api/grid-items")
                        .with(auth)
                        .param("col1", "col1-002")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(1))
                .andExpect(jsonPath("$.content[0].col1").value("aaa-1-1-col1-002"));
    }

    private static class JsonPathUtils {
        private JsonPathUtils() {
        }

        static long readLong(String json, String path) {
            return com.jayway.jsonpath.JsonPath.parse(json).read(path, Number.class).longValue();
        }
    }
}
