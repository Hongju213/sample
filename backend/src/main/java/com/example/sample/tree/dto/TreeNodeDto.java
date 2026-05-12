package com.example.sample.tree.dto;

import java.util.List;

public class TreeNodeDto {

    private Long id;
    private String nodeKey;
    private String nodeName;
    private String parentKey;
    private Integer levelNo;
    private Integer sortOrder;

    // 프론트엔드 트리 구성용 (서비스 레이어에서 조립)
    private List<TreeNodeDto> children;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNodeKey() { return nodeKey; }
    public void setNodeKey(String nodeKey) { this.nodeKey = nodeKey; }

    public String getNodeName() { return nodeName; }
    public void setNodeName(String nodeName) { this.nodeName = nodeName; }

    public String getParentKey() { return parentKey; }
    public void setParentKey(String parentKey) { this.parentKey = parentKey; }

    public Integer getLevelNo() { return levelNo; }
    public void setLevelNo(Integer levelNo) { this.levelNo = levelNo; }

    public Integer getSortOrder() { return sortOrder; }
    public void setSortOrder(Integer sortOrder) { this.sortOrder = sortOrder; }

    public List<TreeNodeDto> getChildren() { return children; }
    public void setChildren(List<TreeNodeDto> children) { this.children = children; }
}
