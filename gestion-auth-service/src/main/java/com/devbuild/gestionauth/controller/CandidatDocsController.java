package com.devbuild.gestionauth.controller;

import com.devbuild.gestionauth.model.Document;
import com.devbuild.gestionauth.model.User;
import com.devbuild.gestionauth.service.DocumentService;
import com.devbuild.gestionauth.service.UserService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;

@Controller
public class CandidatDocsController {

    private final DocumentService documentService;
    private final UserService userService;

    public CandidatDocsController(DocumentService documentService, UserService userService) {
        this.documentService = documentService;
        this.userService = userService;
    }

    @GetMapping("/candidat/documents")
    public String docsPage(Model model, java.security.Principal principal,
                           @RequestParam(name = "q", required = false) String q,
                        @RequestParam(name = "category", required = false) String category,
                        @RequestParam(name = "note", required = false) String note,
                           @RequestParam(name = "page", required = false, defaultValue = "0") int page,
                           @RequestParam(name = "size", required = false, defaultValue = "10") int size) {
        // The SPA handles rendering; API endpoints (GET /api/...) should be used to fetch documents.
        return "forward:/index.html";
    }

    @GetMapping("/candidat/documents/add")
    public String addDocumentPage(Model model, java.security.Principal principal) {
        return "forward:/index.html";
    }

    @PostMapping("/candidat/documents/upload")
    public String upload(@RequestParam(name = "file") MultipartFile file,
                         @RequestParam(name = "title", required = false) String title,
                         @RequestParam(name = "category", required = false) String category,
                         @RequestParam(name = "note", required = false) String note,
                         java.security.Principal principal, org.springframework.web.servlet.mvc.support.RedirectAttributes ra) {
        if (principal == null) return "redirect:/login";
        try {
            User u = userService.findByEmail(principal.getName()).orElseThrow();
            documentService.store(u, file, title, category, note);
            ra.addFlashAttribute("message", "Fichier uploadé");
        } catch (Exception ex) {
            ra.addFlashAttribute("error", "Upload failed: " + ex.getMessage());
        }
        return "redirect:/candidat/documents";
    }

    @PostMapping("/candidat/documents/delete")
    public String delete(@RequestParam(name = "id") Long id, java.security.Principal principal, org.springframework.web.servlet.mvc.support.RedirectAttributes ra) {
        if (principal == null) return "redirect:/login";
        try {
            User u = userService.findByEmail(principal.getName()).orElseThrow();
            documentService.delete(id, u);
            ra.addFlashAttribute("message", "Document supprimé");
        } catch (Exception ex) {
            ra.addFlashAttribute("error", "Delete failed: " + ex.getMessage());
        }
        return "redirect:/candidat/documents";
    }
}
