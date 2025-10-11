package com.devbuild.doctorant.controller;

import com.devbuild.doctorant.dto.DoctorantDto;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/doctorants")
public class DoctorantController {

    @GetMapping
    public List<DoctorantDto> list() {
        DoctorantDto d = new DoctorantDto();
        d.setId(1L); d.setNom("Dupont"); d.setPrenom("Jean"); d.setEmail("jean.dupont@example.com");
        return List.of(d);
    }
}
