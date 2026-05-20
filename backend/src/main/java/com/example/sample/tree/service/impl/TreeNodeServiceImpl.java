package com.example.sample.tree.service.impl;

import com.example.sample.common.MessageHandler;
import com.example.sample.tree.dto.TreeNodeDto;
import com.example.sample.tree.mapper.TreeNodeMapper;
import com.example.sample.tree.service.TreeNodeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
@Slf4j
public class TreeNodeServiceImpl implements TreeNodeService {

    private final TreeNodeMapper treeNodeMapper;
    private final MessageHandler messageHandler;

    @Override
    public List<TreeNodeDto> selectTreeNodes(TreeNodeDto treeNodeDto) {
        List<TreeNodeDto> flatList = treeNodeMapper.findAllByTreeNodeDto(treeNodeDto);
        return buildTree(flatList);
    }

    private List<TreeNodeDto> buildTree(List<TreeNodeDto> flatList) {
        Map<String, TreeNodeDto> nodeMap = flatList.stream()
                .collect(Collectors.toMap(TreeNodeDto::getNodeKey, node -> node));

        List<TreeNodeDto> roots = new ArrayList<>();

        for (TreeNodeDto node : flatList) {
            node.setChildren(new ArrayList<>());
            if (node.getParentKey() == null || node.getParentKey().isEmpty()) {
                roots.add(node);
            } else {
                TreeNodeDto parent = nodeMap.get(node.getParentKey());
                if (parent != null) {
                    parent.getChildren().add(node);
                }
            }
        }
        return roots;
    }
}
