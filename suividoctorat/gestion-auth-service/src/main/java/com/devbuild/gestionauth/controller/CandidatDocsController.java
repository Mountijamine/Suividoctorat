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
                           @RequestParam(name = "page", required = false, defaultValue = "0") int page,
                           @RequestParam(name = "size", required = false, defaultValue = "10") int size) {
        if (principal == null) return "redirect:/login";
        User u = userService.findByEmail(principal.getName()).orElseThrow();
        org.springframework.data.domain.Page<Document> docsPage = documentService.listFor(u, org.springframework.data.domain.PageRequest.of(page, size));
        java.util.List<Document> docs = docsPage.getContent();
        if (q != null && !q.isBlank()) {
            docs = docs.stream().filter(d -> (d.getOriginalFilename()!=null && d.getOriginalFilename().toLowerCase().contains(q.toLowerCase())) || (d.getTitle()!=null && d.getTitle().toLowerCase().contains(q.toLowerCase()))).collect(java.util.stream.Collectors.toList());
        }
        if (category != null && !category.isBlank()) {
            docs = docs.stream().filter(d -> category.equalsIgnoreCase(d.getCategory())).collect(java.util.stream.Collectors.toList());
        }
        model.addAttribute("docs", docs);
        model.addAttribute("q", q);
        model.addAttribute("category", category);
        model.addAttribute("page", page);
        model.addAttribute("size", size);
        model.addAttribute("totalPages", docsPage.getTotalPages());
        model.addAttribute("totalElements", docsPage.getTotalElements());
        return "candidat/documents";
    }

    @GetMapping("/candidat/documents/add")
    public String addDocumentPage(Model model, java.security.Principal principal) {
        if (principal == null) return "redirect:/login";
        // Provide an empty model for the add form
        model.addAttribute("categoriesHint", "You can enter a new category name or reuse an existing one.");
        return "candidat/add_document";
    }

    @PostMapping("/candidat/documents/upload")
    public String upload(@RequestParam(name = "file") MultipartFile file,
                         @RequestParam(name = "title", required = false) String title,
                         @RequestParam(name = "category", required = false) String category,
                         java.security.Principal principal, org.springframework.web.servlet.mvc.support.RedirectAttributes ra) {
        if (principal == null) return "redirect:/login";
        try {
            User u = userService.findByEmail(principal.getName()).orElseThrow();
            documentService.store(u, file, title, category);
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
