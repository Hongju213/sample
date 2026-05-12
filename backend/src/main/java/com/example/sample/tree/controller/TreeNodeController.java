package com.example.sample.tree.controller;

import com.example.sample.common.CommonResponse;
import com.example.sample.tree.dto.TreeNodeDto;
import com.example.sample.tree.service.TreeNodeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Tag(name = "TreeNode", description = "트리 노드 API")
@RestController
@RequestMapping("/api/tree-nodes")
public class TreeNodeController extends CommonResponse {

    private final TreeNodeService treeNodeService;

    public TreeNodeController(TreeNodeService treeNodeService) {
        this.treeNodeService = treeNodeService;
    }

    @Operation(summary = "트리 노드 목록 조회 (계층 구조)")
    @GetMapping
    public ResponseEntity<List<TreeNodeDto>> selectTreeNodes(TreeNodeDto dto) {
        return success(treeNodeService.selectTreeNodes(dto));
    }
}
