package com.example.sample.tree.controller;

import com.example.sample.common.CommonResponse;
import com.example.sample.tree.dto.TreeNodeDto;
import com.example.sample.tree.service.TreeNodeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Tag(name = "TreeNode", description = "Tree node API")
@RestController
@RequestMapping("/api/tree-nodes")
@RequiredArgsConstructor
public class TreeNodeController extends CommonResponse {

    private final TreeNodeService treeNodeService;

    @Operation(summary = "Select tree nodes")
    @GetMapping
    public ResponseEntity<List<TreeNodeDto>> selectTreeNodes(TreeNodeDto treeNodeDto) {
        return success(treeNodeService.selectTreeNodes(treeNodeDto));
    }
}
