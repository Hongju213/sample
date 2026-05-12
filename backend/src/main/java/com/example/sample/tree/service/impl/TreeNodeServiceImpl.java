package com.example.sample.tree.service.impl;

import com.example.sample.common.MessageHandler;
import com.example.sample.tree.dto.TreeNodeDto;
import com.example.sample.tree.mapper.TreeNodeMapper;
import com.example.sample.tree.service.TreeNodeService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class TreeNodeServiceImpl implements TreeNodeService {

    private static final Logger log = LoggerFactory.getLogger(TreeNodeServiceImpl.class);

    private final TreeNodeMapper treeNodeMapper;
    private final MessageHandler messageHandler;

    public TreeNodeServiceImpl(TreeNodeMapper treeNodeMapper, MessageHandler messageHandler) {
        this.treeNodeMapper = treeNodeMapper;
        this.messageHandler = messageHandler;
    }

    @Override
    public List<TreeNodeDto> selectTreeNodes(TreeNodeDto dto) {
        List<TreeNodeDto> flatList = treeNodeMapper.findAllByTreeNodeDto(dto);
        return buildTree(flatList);
    }

    // 플랫 리스트를 트리 구조로 조립
    private List<TreeNodeDto> buildTree(List<TreeNodeDto> flatList) {
        Map<String, TreeNodeDto> nodeMap = flatList.stream()
                .collect(Collectors.toMap(TreeNodeDto::getNodeKey, n -> n));

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
