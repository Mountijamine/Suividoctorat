package com.devbuild.common.mapper;

import com.devbuild.common.dto.DoctorantDto;
import com.devbuild.common.model.Doctorant;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface DoctorantMapper {
    DoctorantDto toDto(Doctorant entity);
    Doctorant toEntity(DoctorantDto dto);
}
