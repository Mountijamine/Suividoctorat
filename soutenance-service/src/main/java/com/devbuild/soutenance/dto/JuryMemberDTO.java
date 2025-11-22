package com.devbuild.soutenance.dto;

import com.devbuild.soutenance.model.RoleJury;
import lombok.Data;

@Data
public class JuryMemberDTO {
    private String nom;
    private String prenom;
    private String email;
    private String etablissement;
    private String grade;
    private RoleJury role;
    private String commentaires;
}
