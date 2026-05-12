package com.example.sample.tree.service;

import com.example.sample.tree.dto.TreeNodeDto;

import java.util.List;

public interface TreeNodeService {

    List<TreeNodeDto> selectTreeNodes(TreeNodeDto dto);
}
