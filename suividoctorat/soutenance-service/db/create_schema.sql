-- ========================================
-- DATABASE SCHEMA FOR SOUTENANCE SERVICE
-- ========================================

-- Create database (run this separately if needed)
-- CREATE DATABASE soutenance_db;

-- Drop tables if they exist (for clean setup)
DROP TABLE IF EXISTS membres_jury CASCADE;
DROP TABLE IF EXISTS jurys CASCADE;
DROP TABLE IF EXISTS documents CASCADE;
DROP TABLE IF EXISTS prerequis CASCADE;
DROP TABLE IF EXISTS soutenances CASCADE;

-- ========================================
-- SOUTENANCES TABLE
-- ========================================
CREATE TABLE soutenances (
    id BIGSERIAL PRIMARY KEY,
    sujet VARCHAR(500) NOT NULL,
    titre_these VARCHAR(500) NOT NULL,
    date_souhaitee DATE NOT NULL,
    date_defense DATE,
    heure_defense TIME,
    salle_defense VARCHAR(100),
    doctorant_id BIGINT NOT NULL,
    doctorant_nom VARCHAR(100),
    doctorant_prenom VARCHAR(100),
    doctorant_email VARCHAR(150),
    directeur_id BIGINT NOT NULL,
    directeur_nom VARCHAR(100),
    directeur_email VARCHAR(150),
    admin_id BIGINT,
    statut VARCHAR(50) NOT NULL DEFAULT 'SOUMISE',
    commentaire_directeur TEXT,
    commentaire_admin TEXT,
    autorisation_path VARCHAR(500),
    date_creation TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_validation_directeur TIMESTAMP,
    date_autorisation TIMESTAMP,
    
    CONSTRAINT chk_statut CHECK (statut IN ('SOUMISE', 'VALIDEE', 'REJETEE', 'AUTORISEE', 'PLANIFIEE', 'TERMINEE'))
);

-- ========================================
-- DOCUMENTS TABLE
-- ========================================
CREATE TABLE documents (
    id BIGSERIAL PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    nom_fichier VARCHAR(255) NOT NULL,
    chemin_fichier VARCHAR(500) NOT NULL,
    taille_fichier BIGINT,
    format_fichier VARCHAR(50),
    valide BOOLEAN NOT NULL DEFAULT FALSE,
    soutenance_id BIGINT NOT NULL,
    date_upload TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_documents_soutenance FOREIGN KEY (soutenance_id) REFERENCES soutenances(id) ON DELETE CASCADE,
    CONSTRAINT chk_type CHECK (type IN ('DEMANDE_MANUSCRITE', 'RAPPORT_THESE', 'RAPPORT_ANTI_PLAGIAT', 
                                         'PUBLICATIONS_COMMUNICATIONS', 'ATTESTATIONS_FORMATION', 'AUTORISATION_SOUTENANCE'))
);

-- ========================================
-- PREREQUIS TABLE
-- ========================================
CREATE TABLE prerequis (
    id BIGSERIAL PRIMARY KEY,
    soutenance_id BIGINT NOT NULL UNIQUE,
    nombre_articles_q1_q2 INTEGER NOT NULL DEFAULT 0,
    nombre_conferences INTEGER NOT NULL DEFAULT 0,
    heures_formation INTEGER NOT NULL DEFAULT 0,
    articles_valide BOOLEAN NOT NULL DEFAULT FALSE,
    conferences_valide BOOLEAN NOT NULL DEFAULT FALSE,
    formation_valide BOOLEAN NOT NULL DEFAULT FALSE,
    documents_valide BOOLEAN NOT NULL DEFAULT FALSE,
    remarques TEXT,
    date_verification TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_prerequis_soutenance FOREIGN KEY (soutenance_id) REFERENCES soutenances(id) ON DELETE CASCADE
);

-- ========================================
-- JURYS TABLE
-- ========================================
CREATE TABLE jurys (
    id BIGSERIAL PRIMARY KEY,
    soutenance_id BIGINT NOT NULL UNIQUE,
    president_nom VARCHAR(100),
    president_email VARCHAR(150),
    president_institution VARCHAR(200),
    commentaires TEXT,
    valide BOOLEAN NOT NULL DEFAULT FALSE,
    
    CONSTRAINT fk_jurys_soutenance FOREIGN KEY (soutenance_id) REFERENCES soutenances(id) ON DELETE CASCADE
);

-- ========================================
-- MEMBRES_JURY TABLE
-- ========================================
CREATE TABLE membres_jury (
    id BIGSERIAL PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL,
    institution VARCHAR(200) NOT NULL,
    grade VARCHAR(100) NOT NULL,
    type_role VARCHAR(20) NOT NULL,
    jury_id BIGINT NOT NULL,
    rapport_path VARCHAR(500),
    rapport_favorable BOOLEAN,
    
    CONSTRAINT fk_membres_jury_jury FOREIGN KEY (jury_id) REFERENCES jurys(id) ON DELETE CASCADE,
    CONSTRAINT chk_type_role CHECK (type_role IN ('RAPPORTEUR', 'EXAMINATEUR'))
);

-- ========================================
-- INDEXES FOR PERFORMANCE
-- ========================================
CREATE INDEX idx_soutenances_doctorant ON soutenances(doctorant_id);
CREATE INDEX idx_soutenances_directeur ON soutenances(directeur_id);
CREATE INDEX idx_soutenances_statut ON soutenances(statut);
CREATE INDEX idx_soutenances_date_defense ON soutenances(date_defense);
CREATE INDEX idx_documents_soutenance ON documents(soutenance_id);
CREATE INDEX idx_documents_type ON documents(type);
CREATE INDEX idx_membres_jury_jury ON membres_jury(jury_id);
CREATE INDEX idx_membres_jury_type ON membres_jury(type_role);

-- ========================================
-- SAMPLE DATA (for testing)
-- ========================================

-- Sample Soutenance 1 (Soumise)
INSERT INTO soutenances (sujet, titre_these, date_souhaitee, doctorant_id, doctorant_nom, doctorant_prenom, 
                         doctorant_email, directeur_id, directeur_nom, directeur_email, statut)
VALUES ('Intelligence Artificielle', 
        'Apprentissage profond pour la détection d''anomalies dans les réseaux IoT',
        '2025-06-15',
        1001,
        'ALAMI',
        'Mohammed',
        'mohammed.alami@univ.ma',
        2001,
        'Dr. BENALI',
        'benali@univ.ma',
        'SOUMISE');

-- Prerequis for Soutenance 1
INSERT INTO prerequis (soutenance_id, nombre_articles_q1_q2, nombre_conferences, heures_formation,
                       articles_valide, conferences_valide, formation_valide, documents_valide)
VALUES (1, 3, 4, 250, TRUE, TRUE, TRUE, FALSE);

-- Sample Soutenance 2 (Validee)
INSERT INTO soutenances (sujet, titre_these, date_souhaitee, doctorant_id, doctorant_nom, doctorant_prenom,
                         doctorant_email, directeur_id, directeur_nom, directeur_email, statut,
                         commentaire_directeur, date_validation_directeur)
VALUES ('Cybersécurité',
        'Méthodes de détection d''intrusions basées sur l''apprentissage automatique',
        '2025-07-10',
        1002,
        'TAZI',
        'Fatima',
        'fatima.tazi@univ.ma',
        2001,
        'Dr. BENALI',
        'benali@univ.ma',
        'VALIDEE',
        'Excellente thèse, tous les prérequis sont satisfaits.',
        '2025-03-15 10:30:00');

-- Prerequis for Soutenance 2
INSERT INTO prerequis (soutenance_id, nombre_articles_q1_q2, nombre_conferences, heures_formation,
                       articles_valide, conferences_valide, formation_valide, documents_valide)
VALUES (2, 2, 3, 210, TRUE, TRUE, TRUE, TRUE);

-- Jury for Soutenance 2
INSERT INTO jurys (soutenance_id, president_nom, president_email, president_institution, valide)
VALUES (2, 'Prof. RAHIMI Hassan', 'rahimi@ensa.ma', 'ENSA Tétouan', TRUE);

-- Rapporteurs for Jury
INSERT INTO membres_jury (nom, prenom, email, institution, grade, type_role, jury_id)
VALUES 
('BOUAZZA', 'Karim', 'k.bouazza@ensam.ma', 'ENSAM Meknès', 'Professeur', 'RAPPORTEUR', 1),
('MANSOURI', 'Sara', 's.mansouri@fst.ma', 'FST Tanger', 'Professeur', 'RAPPORTEUR', 1);

-- Examinateurs for Jury
INSERT INTO membres_jury (nom, prenom, email, institution, grade, type_role, jury_id)
VALUES 
('CHAKIR', 'Ahmed', 'a.chakir@uh2c.ma', 'Université Hassan II', 'Maître de Conférences', 'EXAMINATEUR', 1),
('IDRISSI', 'Lamia', 'l.idrissi@usmba.ma', 'Université Sidi Mohamed Ben Abdellah', 'Maître de Conférences', 'EXAMINATEUR', 1);

-- Sample Soutenance 3 (Autorisee)
INSERT INTO soutenances (sujet, titre_these, date_souhaitee, date_defense, heure_defense, salle_defense,
                         doctorant_id, doctorant_nom, doctorant_prenom, doctorant_email,
                         directeur_id, directeur_nom, directeur_email,
                         admin_id, statut, commentaire_directeur, commentaire_admin,
                         date_validation_directeur, date_autorisation)
VALUES ('Blockchain et Cryptographie',
        'Applications de la blockchain dans la sécurisation des données médicales',
        '2025-05-20',
        '2025-05-22',
        '10:00:00',
        'Amphi A - Bâtiment Sciences',
        1003,
        'BENNANI',
        'Youssef',
        'youssef.bennani@univ.ma',
        2002,
        'Dr. AMRANI',
        'amrani@univ.ma',
        3001,
        'AUTORISEE',
        'Thèse de haute qualité, contribution significative au domaine.',
        'Autorisation accordée. Tous les documents sont conformes.',
        '2025-04-01 14:00:00',
        '2025-04-10 09:30:00');

-- Prerequis for Soutenance 3
INSERT INTO prerequis (soutenance_id, nombre_articles_q1_q2, nombre_conferences, heures_formation,
                       articles_valide, conferences_valide, formation_valide, documents_valide)
VALUES (3, 4, 5, 280, TRUE, TRUE, TRUE, TRUE);

-- Jury for Soutenance 3
INSERT INTO jurys (soutenance_id, president_nom, president_email, president_institution, valide)
VALUES (3, 'Prof. BERRADA Nadia', 'berrada@um5.ma', 'Université Mohammed V', TRUE);

-- Rapporteurs for Jury 3
INSERT INTO membres_jury (nom, prenom, email, institution, grade, type_role, jury_id, rapport_favorable)
VALUES 
('ELKAMEL', 'Rachid', 'r.elkamel@uir.ac.ma', 'UIR Rabat', 'Professeur', 'RAPPORTEUR', 2, TRUE),
('ZAHRAOUI', 'Meryem', 'm.zahraoui@emi.ac.ma', 'EMI Rabat', 'Professeur', 'RAPPORTEUR', 2, TRUE);

-- Examinateurs for Jury 3
INSERT INTO membres_jury (nom, prenom, email, institution, grade, type_role, jury_id)
VALUES 
('FASSI', 'Omar', 'o.fassi@uiz.ma', 'Université Ibn Zohr', 'Maître de Conférences HDR', 'EXAMINATEUR', 2),
('TAHIRI', 'Sanaa', 's.tahiri@uca.ma', 'Université Cadi Ayyad', 'Maître de Conférences', 'EXAMINATEUR', 2),
('LAHLOU', 'Hassan', 'h.lahlou@ehtp.ac.ma', 'EHTP Casablanca', 'Professeur Associé', 'EXAMINATEUR', 2);

-- ========================================
-- SUMMARY VIEWS (optional, for reporting)
-- ========================================

CREATE OR REPLACE VIEW v_soutenances_statistics AS
SELECT 
    statut,
    COUNT(*) as nombre,
    AVG(EXTRACT(EPOCH FROM (date_modification - date_creation))/86400) as duree_moyenne_jours
FROM soutenances
GROUP BY statut;

CREATE OR REPLACE VIEW v_soutenances_en_cours AS
SELECT 
    s.id,
    s.titre_these,
    s.doctorant_nom,
    s.doctorant_prenom,
    s.directeur_nom,
    s.statut,
    s.date_creation,
    p.nombre_articles_q1_q2,
    p.nombre_conferences,
    p.heures_formation,
    CASE 
        WHEN p.articles_valide AND p.conferences_valide AND p.formation_valide AND p.documents_valide 
        THEN TRUE 
        ELSE FALSE 
    END as prerequis_complets
FROM soutenances s
LEFT JOIN prerequis p ON s.id = p.soutenance_id
WHERE s.statut IN ('SOUMISE', 'VALIDEE', 'AUTORISEE', 'PLANIFIEE')
ORDER BY s.date_creation DESC;
