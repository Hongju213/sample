# Backend Development Guide

## Standard Module Shape

Backend business modules should follow this package shape.

```text
com.example.sample.<domain>
  controller
    <Domain>Controller.java
  dto
    <Domain>Dto.java
    <Domain>SearchDto.java
    Create<Domain>Dto.java
    Update<Domain>Dto.java
  mapper
    <Domain>Mapper.java
  service
    <Domain>Service.java
    impl
      <Domain>ServiceImpl.java

resources/mybatis/common/<domain>/<Domain>Mapper.xml
```

## Controller

Controllers extend `CommonResponse`, inject only the service, and keep logic thin.

```java
@Tag(name = "CommonCode", description = "Common code API")
@RestController
@RequestMapping("/api/common-codes")
@RequiredArgsConstructor
public class CommonCodeController extends CommonResponse {

    private final CommonCodeService commonCodeService;

    @GetMapping
    @Operation(summary = "Select common codes")
    public ResponseEntity<Page<CommonCodeDto>> selectCode(
            CommonCodeSearchDto commonCodeSearchDto,
            Pageable pageable) {
        Page<CommonCodeDto> findAllCodes = commonCodeService.selectCode(commonCodeSearchDto, pageable);
        return success(findAllCodes);
    }

    @PostMapping
    @Operation(summary = "Create common code")
    public ResponseEntity<ResultDto> createCommonCode(
            @Validated @RequestBody CreateCommonCodeDto createCommonCodeDto) {
        return success(commonCodeService.createCommonCode(createCommonCodeDto));
    }
}
```

## Service

Services define the business contract. Use DTOs that match the command/query intent.

```java
public interface CommonCodeService {

    Page<CommonCodeDto> selectCode(CommonCodeSearchDto commonCodeSearchDto, Pageable pageable);

    ResultDto createCommonCode(CreateCommonCodeDto createCommonCodeDto);
}
```

## Service Implementation

Implementations own transaction boundaries and compose Mapper calls. Read methods stay under
`@Transactional(readOnly = true)`, and write methods override with `@Transactional`.

```java
@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
@Slf4j
public class CommonCodeServiceImpl implements CommonCodeService {

    private final CommonCodeMapper commonCodeMapper;
    private final MessageHandler messageHandler;
    private final CacheManager cacheManager;

    @Override
    public Page<CommonCodeDto> selectCode(CommonCodeSearchDto commonCodeSearchDto, Pageable pageable) {
        List<CommonCodeDto> findAll = commonCodeMapper.findAllByCommonCodeSearchDto(
                commonCodeSearchDto,
                pageable.getOffset(),
                pageable.getPageSize());
        int totalCount = commonCodeMapper.countByCommonCodeSearchDto(commonCodeSearchDto);
        return new PageImpl<>(findAll, pageable, totalCount);
    }

    @Override
    @Transactional
    public ResultDto createCommonCode(CreateCommonCodeDto createCommonCodeDto) {
        commonCodeMapper.insert(createCommonCodeDto);
        cacheManager.evictCaches();
        return ResultDto.ok("Created");
    }
}
```

## Mapper Interface

Mapper search parameters use `@Param("condition")`; pagination parameters are always
`offset` and `limit`.

```java
@Mapper
public interface CommonCodeMapper {

    List<CommonCodeDto> findAllByCommonCodeSearchDto(
            @Param("condition") CommonCodeSearchDto commonCodeSearchDto,
            @Param("offset") long offset,
            @Param("limit") int limit);

    int countByCommonCodeSearchDto(@Param("condition") CommonCodeSearchDto commonCodeSearchDto);
}
```

## Mapper XML

Mapper XML files live under `resources/mybatis/common/<domain>/`. Oracle pagination uses
`OFFSET #{offset} ROWS FETCH NEXT #{limit} ROWS ONLY`.

```xml
<select id="findAllByCommonCodeSearchDto" resultMap="CommonCodeDtoResultMap">
    SELECT APP_ID, CD_GRP_ID, CD_ID, CD_NM, USE_YN, ALIGNSEQ
    FROM COMMON_CODE
    <where>
        <if test="condition.appId != null and condition.appId != ''">
            AND APP_ID = #{condition.appId}
        </if>
        <if test="condition.cdGrpId != null and condition.cdGrpId != ''">
            AND CD_GRP_ID = #{condition.cdGrpId}
        </if>
        <if test="condition.useYn != null and condition.useYn != ''">
            AND USE_YN = #{condition.useYn}
        </if>
    </where>
    ORDER BY CD_GRP_ID, ALIGNSEQ ASC
    OFFSET #{offset} ROWS FETCH NEXT #{limit} ROWS ONLY
</select>
```

## Current Template

`sample` is the reference CRUD module:

- `SampleItemController`
- `SampleItemService` / `SampleItemServiceImpl`
- `SampleItemMapper`
- `resources/mybatis/common/sample/SampleItemMapper.xml`
- `SampleItemDto`, `SampleItemSearchDto`, `CreateSampleItemDto`, `UpdateSampleItemDto`
