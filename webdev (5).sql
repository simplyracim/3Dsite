-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1
-- Généré le : sam. 05 avr. 2025 à 19:43
-- Version du serveur : 10.4.32-MariaDB
-- Version de PHP : 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `webdev`
--

-- --------------------------------------------------------

--
-- Structure de la table `candidature`
--

CREATE TABLE `candidature` (
  `Id_Candidature` int(11) NOT NULL,
  `date_candidature` datetime DEFAULT NULL,
  `lettre_motivation` text NOT NULL,
  `Id_Offre` int(11) NOT NULL,
  `Id_Utilisateur` int(11) NOT NULL,
  `cv_path` varchar(255) DEFAULT NULL COMMENT 'Chemin vers le fichier CV en PDF'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `candidature`
--

INSERT INTO `candidature` (`Id_Candidature`, `date_candidature`, `lettre_motivation`, `Id_Offre`, `Id_Utilisateur`, `cv_path`) VALUES
(76, '2025-04-05 17:08:29', 'Je souhaite postuler', 13, 27, 'uploads/cv/15_13_1743869309.pdf'),
(77, '2025-04-05 17:23:09', 'Je suis motivé et prêt à m\'investir pleinement dans les missions proposées. J’ai hâte de contribuer à vos projets.', 17, 43, 'uploads/cv/15_17_1743870189.pdf'),
(78, '2025-04-05 17:23:29', 'Je suis curieux, sérieux et toujours prêt à apprendre. Rejoindre votre structure serait une belle opportunité.', 7, 27, 'uploads/cv/15_7_1743870209.pdf'),
(79, '2025-04-05 17:23:51', 'Je vous adresse ma candidature avec enthousiasme. Je suis convaincu de pouvoir m’adapter rapidement.', 15, 35, 'uploads/cv/15_15_1743870231.pdf'),
(80, '2025-04-05 17:24:04', 'Je vous adresse ma candidature avec enthousiasme. Je suis convaincu de pouvoir m’adapter rapidement.', 10, 30, 'uploads/cv/15_10_1743870244.pdf'),
(81, '2025-04-05 17:24:20', 'Je vous adresse ma candidature avec enthousiasme. Je suis convaincu de pouvoir m’adapter rapidement.', 4, 33, 'uploads/cv/15_4_1743870260.pdf'),
(82, '2025-04-05 17:24:33', 'Intégrer votre équipe représente pour moi un vrai challenge. Je suis déterminé à y réussir.', 5, 45, 'uploads/cv/15_5_1743870273.pdf'),
(83, '2025-04-05 17:24:46', 'Intégrer votre équipe représente pour moi un vrai challenge. Je suis déterminé à y réussir.', 8, 47, 'uploads/cv/15_8_1743870286.pdf'),
(84, '2025-04-05 17:25:02', 'Je suis à la recherche d\'une expérience enrichissante. Votre entreprise m\'attire pour sa dynamique.', 9, 48, 'uploads/cv/15_9_1743870302.pdf'),
(85, '2025-04-05 17:25:19', 'Je suis à la recherche d\'une expérience enrichissante. Votre entreprise m\'attire pour sa dynamique.', 11, 38, 'uploads/cv/15_11_1743870319.pdf'),
(86, '2025-04-05 17:25:38', 'Je suis très motivé et je cherche une opportunité pour m’impliquer à long terme.', 18, 42, 'uploads/cv/15_18_1743870338.pdf'),
(87, '2025-04-05 17:26:06', 'Je suis enthousiaste à l’idée de rejoindre une équipe aussi engagée que la vôtre.', 6, 43, 'uploads/cv/15_6_1743870366.pdf');

-- --------------------------------------------------------

--
-- Structure de la table `compétences`
--

CREATE TABLE `compétences` (
  `Id_competences` int(11) NOT NULL,
  `nom_competences` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `compétences`
--

INSERT INTO `compétences` (`Id_competences`, `nom_competences`) VALUES
(1, 'JavaScript'),
(2, 'PHP'),
(3, 'HTML'),
(4, 'CSS'),
(5, 'MySQL'),
(6, 'React'),
(7, 'Node.js'),
(8, 'Python'),
(9, 'Java'),
(10, 'C++'),
(11, 'Angular'),
(12, 'Vue.js'),
(13, 'Laravel'),
(14, 'Symfony'),
(15, 'Git');

-- --------------------------------------------------------

--
-- Structure de la table `entreprise`
--

CREATE TABLE `entreprise` (
  `Id_Entreprise` int(11) NOT NULL,
  `nom_entreprise` varchar(255) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `telephone` varchar(20) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `moyenne_evaluation` decimal(3,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `entreprise`
--

INSERT INTO `entreprise` (`Id_Entreprise`, `nom_entreprise`, `email`, `telephone`, `description`, `moyenne_evaluation`) VALUES
(9, 'TechNova', 'contact.technova@gmail.com', '0102030405', 'Entreprise innovante en tech et IA', 4.00),
(10, 'GreenWorld', 'info.greenworld@gmail.com', '0612345678', 'Spécialisée dans les solutions écologiques', 3.00),
(11, 'Buildify', 'contact.buildify@gmail.com', '0987654321', 'BTP et architecture durable', 2.00),
(12, 'Mediart', 'hello.mediart@gmail.com', '0711223344', 'Agence de communication et design', 3.00),
(13, 'AgriBio', 'contact.agribio@gmail.com', '0606060606', 'Agriculture biologique et circuits courts', 1.00),
(14, 'StartNet', 'team.startnet@gmail.com', '0755443322', 'Incubateur de startups numériques', 2.00),
(15, 'EduSmart', 'info.edusmart@gmail.com', '0666777888', 'EdTech pour les outils pédagogiques', NULL),
(16, 'MobilEase', 'support.mobilease@gmail.com', '0147852369', 'Solutions de mobilité urbaine', 4.00),
(17, 'FinOpti', 'contact.finopti@gmail.com', '0189898989', 'Services de gestion financière intelligente', 1.00),
(18, 'HealthCore', 'admin.healthcore@gmail.com', '0678945612', 'Technologie pour la santé connectée', 2.00);

-- --------------------------------------------------------

--
-- Structure de la table `eval_entreprise`
--

CREATE TABLE `eval_entreprise` (
  `Id_Eval_entreprise` int(11) NOT NULL,
  `Id_Utilisateur` int(11) NOT NULL,
  `Id_Entreprise` int(11) NOT NULL,
  `note` tinyint(4) DEFAULT NULL CHECK (`note` between 1 and 5)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `eval_entreprise`
--

INSERT INTO `eval_entreprise` (`Id_Eval_entreprise`, `Id_Utilisateur`, `Id_Entreprise`, `note`) VALUES
(74, 27, 9, 4),
(109, 28, 9, 4),
(110, 29, 10, 3),
(111, 30, 10, 3),
(112, 31, 11, 5),
(113, 32, 12, 2),
(114, 33, 13, 5),
(115, 34, 14, 4),
(116, 35, 15, 2),
(117, 36, 16, 5),
(118, 37, 17, 5),
(119, 38, 18, 3),
(120, 39, 9, 5),
(121, 40, 10, 1),
(122, 41, 11, 3),
(123, 42, 12, 1),
(124, 43, 13, 3),
(125, 45, 14, 4),
(126, 46, 15, 3),
(127, 47, 16, 5),
(128, 48, 17, 4),
(129, 27, 18, 2),
(130, 28, 10, 4),
(131, 29, 11, 5),
(132, 30, 12, 2),
(133, 31, 13, 3),
(134, 32, 14, 3),
(135, 33, 15, 4),
(136, 34, 16, 1),
(137, 35, 17, 5),
(138, 36, 18, 4),
(139, 37, 9, 2),
(140, 38, 11, 5),
(141, 40, 13, 2),
(142, 15, 10, 4);

-- --------------------------------------------------------

--
-- Structure de la table `offre`
--

CREATE TABLE `offre` (
  `Id_Offre` int(11) NOT NULL,
  `titre_offre` varchar(255) NOT NULL,
  `description_offre` text DEFAULT NULL,
  `remuneration` decimal(10,2) DEFAULT NULL,
  `date_debut` date NOT NULL,
  `date_fin` date NOT NULL,
  `Id_Entreprise` int(11) NOT NULL,
  `competences` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `offre`
--

INSERT INTO `offre` (`Id_Offre`, `titre_offre`, `description_offre`, `remuneration`, `date_debut`, `date_fin`, `Id_Entreprise`, `competences`) VALUES
(4, 'Développeur Web Junior', 'Rejoignez notre équipe pour créer des sites web dynamiques.', 800.00, '2025-05-01', '2025-08-01', 9, 'HTML,CSS,JavaScript'),
(5, 'Développeur Backend', 'Conception d’API REST avec Node.js et bases de données.', 1000.00, '2025-06-01', '2025-09-30', 10, 'Node.js,MySQL'),
(6, 'Intégrateur Front-End', 'Intégration de maquettes pour clients e-commerce.', 750.00, '2025-04-15', '2025-07-15', 10, 'HTML,CSS'),
(7, 'Stage Dev FullStack', 'Participation à un projet complet sous MERN.', 1200.00, '2025-05-10', '2025-08-10', 11, 'React,Node.js,MySQL'),
(8, 'Dév Symfony', 'Développement de modules pour une plateforme B2B.', 950.00, '2025-07-01', '2025-10-01', 12, 'PHP,Symfony,Git'),
(9, 'Développeur Front', 'Amélioration UI/UX sur une application mobile.', 850.00, '2025-04-01', '2025-07-01', 13, 'React,JavaScript'),
(10, 'Stage en Cybersécurité', 'Automatisation de tests de vulnérabilité.', 1100.00, '2025-05-15', '2025-08-15', 14, 'Python,Git'),
(11, 'Développeur Laravel', 'Refonte du backend avec Laravel.', 950.00, '2025-06-01', '2025-09-01', 15, 'Laravel,PHP,MySQL'),
(12, 'Développeur Front Vue.js', 'Développement SPA pour plateforme SaaS.', 1000.00, '2025-05-01', '2025-07-31', 15, 'Vue.js,JavaScript'),
(13, 'Assistant Dev Web', 'Support à l’équipe pour la gestion du site.', 700.00, '2025-05-20', '2025-08-20', 16, 'HTML,CSS'),
(14, 'Développeur Java', 'Mise en place d’un outil de reporting interne.', 900.00, '2025-06-15', '2025-09-15', 17, 'Java,Git'),
(15, 'Stage Dev Mobile', 'Création d’une application mobile hybride.', 1000.00, '2025-05-05', '2025-08-05', 17, 'React,HTML,CSS'),
(16, 'Développeur C++', 'Optimisation d’un logiciel de traitement d’images.', 1100.00, '2025-04-10', '2025-07-10', 18, 'C++,Python'),
(17, 'DevOps Stagiaire', 'Mise en place de CI/CD avec GitLab.', 950.00, '2025-06-01', '2025-09-01', 9, 'Git,Node.js'),
(18, 'Développeur Angular', 'Développement front-end sur Angular 15.', 1050.00, '2025-05-15', '2025-08-15', 12, 'Angular,TypeScript');

-- --------------------------------------------------------

--
-- Structure de la table `offre_competences`
--

CREATE TABLE `offre_competences` (
  `Id_Offre` int(11) NOT NULL,
  `Id_competences` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `utilisateur`
--

CREATE TABLE `utilisateur` (
  `Id_Utilisateur` int(11) NOT NULL,
  `nom_utilisateur` varchar(255) NOT NULL,
  `prenom` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `utilisateur`
--

INSERT INTO `utilisateur` (`Id_Utilisateur`, `nom_utilisateur`, `prenom`, `email`, `password`, `role`) VALUES
(15, 'Joe', 'Swanson', 'joeswanson@example.com', '$2y$10$jTzj7VM/UnhZG/RbA7Qq9.hP6xMqdcs1.TD5nerfkjQnLfRL8LvN.', 'admin'),
(17, 'fenetre', 'man', 'fm@g.com', '$2y$10$.AYGnqeuCVPyIlX6033sZu.PZo.CWmHHE93FXab7bPW6ISqQ9DnZm', 'pilote'),
(18, 'Dupont', 'Alice', 'alice.dupont@example.com', '$2y$10$UHnby1fSvfoSdjABkEHKAeF9WkShpW2cdN9uTsIKmW1NZxCrRzke.', 'pilote'),
(19, 'Martin', 'Lucas', 'lucas.martin@example.com', '$2y$10$T0yUGOjQAbeKdKD6QqMi2uriYz43pzeXGYAzGorFGen3cJkC3U9MO', 'pilote'),
(20, 'Bernard', 'Emma', 'emma.bernard@example.com', '$2y$10$SsTv7eWY33hFTibTyOb63ues1wUMIaovz8iHaiUQK2TE1cLjpdvWm', 'pilote'),
(21, 'Petit', 'Léo', 'leo.petit@example.com', '$2y$10$yRb/E9VZrAR1aAFaQnrEEujbRkUlovPR6l5xyWoFERU//4t6yw0TC', 'pilote'),
(22, 'Robert', 'Chloé', 'chloe.robert@example.com', '$2y$10$Y4hacb0Hw5Dh06JhFk83LO1GYbbgmZAcj27wanwfNJozBe/dlf33y', 'pilote'),
(23, 'Richard', 'Nathan', 'nathan.richard@example.com', '$2y$10$d/NS5RTqPZ.YPsqIDIQTceReqi8GG76kaHuJ7r9rFcOU4PqnY13BK', 'pilote'),
(24, 'Durand', 'Manon', 'manon.durand@example.com', '$2y$10$UxGf..NVsfJyb.vcCGmjju76BhIgdPSC885aWPh3qW0Mj7z59jcqS', 'pilote'),
(25, 'Leroy', 'Tom', 'tom.leroy@example.com', '$2y$10$ebeoXPCcaDO.7mhxbEZk.O/rpUBVKRVK2L0ZUOFS4.I7vAjH4NfVy', 'pilote'),
(26, 'Moreau', 'Lina', 'lina.moreau@example.com', '$2y$10$QcDeGhJRR7ajSpP9xHsnEOnB3jHasW14jfCWbUS9ERpU9598pgTMi', 'pilote'),
(27, 'Simon', 'Mathis', 'mathis.simon@example.com', '$2y$10$wB34Mua1p8rUJySJLQqZTOI9VhJ7wRmFrOGqdbOPYnVxx6O5cbuLO', 'etudiant'),
(28, 'Laurent', 'Sarah', 'sarah.laurent@example.com', '$2y$10$kPWZWjoLb7H4tP1QBf4VhOylLxxiv.LW9E/MPXspBtLtAjr5Py1iS', 'etudiant'),
(29, 'Lemoine', 'Noah', 'noah.lemoine@example.com', '$2y$10$FQewne4PmFVAL4bHek3Yp.YDqvpW.kY6q6HnTetIK1Gl7LOabzijG', 'etudiant'),
(30, 'Garnier', 'Camille', 'camille.garnier@example.com', '$2y$10$95xI6d9F2cdQk/cTyGdJMO7YI68O7EpFPfqiXv37n9P4s6Smy/nQ6', 'etudiant'),
(31, 'Faure', 'Enzo', 'enzo.faure@example.com', '$2y$10$a4indVEotkTVliawEcxY8eZJZaAVyR53V8gKpuP96AAadMox7pYuS', 'etudiant'),
(32, 'Roux', 'Lou', 'lou.roux@example.com', '$2y$10$.RlzOvgcUMNV5BxBJBtQmuVkyuE7dxpFV650YUAR1qzBlJwHSnB5y', 'etudiant'),
(33, 'Colin', 'Colin', 'axel.colin@example.com', '$2y$10$ssruPo6xlP3lSUuYpkndT.fbZajHyBujok8uJ27YyrJW8TlO/HE9C', 'etudiant'),
(34, 'Fernandez', 'Léna', 'lena.fernandez@example.com', '$2y$10$EfQHM0XEilotQRNqOZPcy.9HkqLJq/fUHMWZQUeKAryjlWv8Ipwgy', 'etudiant'),
(35, 'Henry', 'Hugo', 'hugo.henry@example.com', '$2y$10$UcyM2211nf2ESCRsPE6cJOE3zv8x3PBDpT4.E/MW6Af.YeHVXXTrq', 'etudiant'),
(36, 'Renaud', 'Jade', 'jade.renaud@example.com', '$2y$10$rD2ogAjP29xhr2rQk2d0huOzNMmnKQ2x3GXM7jlC5AKqp5RY3Ayvm', 'etudiant'),
(37, 'Masson', 'Noé', 'noe.masson@example.com', '$2y$10$pGVeh68k.1bZ/HreWTKX.OwB3xmdBos6WExeHZfUIXKGwGUYbXUJq', 'etudiant'),
(38, 'Chevalier', 'Clara', 'clara.chevalier@example.com', '$2y$10$TiYOoTj8Dvu0Jt11vAoAGejfkKiL0PIYigrCRwyERsZJobxPFLWPS', 'etudiant'),
(39, 'Lambert', 'Louis', 'louis.lambert@example.com', '$2y$10$A7wqxi01mDcrL/ZUgteSLeuS0OVTq4H2y6t44oZ9CdYr//axmKL/C', 'etudiant'),
(40, 'Bonnet', 'Eva', 'eva.bonnet@example.com', '$2y$10$YdHg8.VwwgPX7t.3x.8lVuM3duO1/Q6dblJMPZSsxxWzth6sDFJr2', 'etudiant'),
(41, 'Barbier', 'Gabriel', 'gabriel.barbier@example.com', '$2y$10$XixXVVOf6/6MIKM8otvI3ejmJNXlKX6N5D846J3JH6DkJw15KWBy.', 'etudiant'),
(42, 'Dupuis', 'Zoé', 'zoe.dupuis@example.com', '$2y$10$seZ2upZeJgrREhH1xAAuS.GtgMsWtuwdsdJtqJY0Gys/6HSuuYatK', 'etudiant'),
(43, 'Muller', 'Liam', 'liam.muller@example.com', '$2y$10$7./NeJXPi2pRgYhQGcx9PuXp4VdcuGe8JoZTaCKqeHHwCDrdtainq', 'etudiant'),
(44, 'Norton', 'Rym', 'Danganronpa@gmail.com', '$2y$10$VTIsrc9ECx4/OBfpGuIwDulK1uvK1QACdpeZspnWCRO.gqSB2d2s.', 'admin'),
(45, 'Brun', 'Anna', 'anna.brun@example.com', '$2y$10$cJUf/NIt1BwZR9Y.ZNnzdOAWYF7eZiY013FPYQr0nSHwTtN3gEkZK', 'etudiant'),
(46, 'Blondel', 'Aaron', 'aaron.blondel@example.com', '$2y$10$Kzj7FtxgdN7pdNScLtD0NuBhEukyeeEDoeYCZHB.puJ.fCwOY75JK', 'etudiant'),
(47, 'Philippe', 'Lola', 'lola.philippe@example.com', '$2y$10$80GmnKdtXitGNo0tOJOB3.kANZ.JLfKCjdMXNIIN5W1HEivUJw9TW', 'etudiant'),
(48, 'Leclerc', 'Ilyes', 'ilyes.leclerc@example.com', '$2y$10$.JP.4UZwcSEICNvgWroLwuXMTg06KTrx5aAUUHJLtO1PEWPJ7YUYK', 'etudiant');

-- --------------------------------------------------------

--
-- Structure de la table `wishlist`
--

CREATE TABLE `wishlist` (
  `Id_Wishlist` int(11) NOT NULL,
  `Id_Offre` int(11) NOT NULL,
  `Id_Utilisateur` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `wishlist`
--

INSERT INTO `wishlist` (`Id_Wishlist`, `Id_Offre`, `Id_Utilisateur`) VALUES
(16, 4, 27),
(17, 5, 28),
(18, 6, 29),
(19, 7, 30),
(20, 8, 31),
(21, 9, 32),
(22, 10, 33),
(23, 11, 34),
(24, 12, 35),
(25, 13, 36),
(26, 14, 37),
(27, 15, 38),
(28, 16, 39),
(29, 17, 40),
(30, 18, 41),
(31, 4, 42),
(32, 5, 43),
(33, 6, 45),
(34, 7, 46),
(35, 8, 47),
(36, 9, 48),
(37, 10, 27),
(38, 11, 28),
(39, 12, 29),
(40, 13, 30),
(41, 14, 31),
(42, 15, 32),
(43, 16, 33),
(44, 17, 34),
(45, 18, 35),
(46, 4, 36),
(47, 5, 37),
(48, 6, 38),
(49, 7, 39),
(50, 8, 40),
(51, 9, 41),
(52, 10, 42);

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `candidature`
--
ALTER TABLE `candidature`
  ADD PRIMARY KEY (`Id_Candidature`),
  ADD KEY `Id_Offre` (`Id_Offre`),
  ADD KEY `Id_Utilisateur` (`Id_Utilisateur`);

--
-- Index pour la table `compétences`
--
ALTER TABLE `compétences`
  ADD PRIMARY KEY (`Id_competences`);

--
-- Index pour la table `entreprise`
--
ALTER TABLE `entreprise`
  ADD PRIMARY KEY (`Id_Entreprise`);

--
-- Index pour la table `eval_entreprise`
--
ALTER TABLE `eval_entreprise`
  ADD PRIMARY KEY (`Id_Eval_entreprise`),
  ADD KEY `Id_Utilisateur` (`Id_Utilisateur`),
  ADD KEY `Id_Entreprise` (`Id_Entreprise`);

--
-- Index pour la table `offre`
--
ALTER TABLE `offre`
  ADD PRIMARY KEY (`Id_Offre`),
  ADD KEY `Id_Entreprise` (`Id_Entreprise`);

--
-- Index pour la table `offre_competences`
--
ALTER TABLE `offre_competences`
  ADD PRIMARY KEY (`Id_Offre`,`Id_competences`),
  ADD KEY `Id_competences` (`Id_competences`);

--
-- Index pour la table `utilisateur`
--
ALTER TABLE `utilisateur`
  ADD PRIMARY KEY (`Id_Utilisateur`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Index pour la table `wishlist`
--
ALTER TABLE `wishlist`
  ADD PRIMARY KEY (`Id_Wishlist`),
  ADD KEY `Id_Offre` (`Id_Offre`),
  ADD KEY `Id_Utilisateur` (`Id_Utilisateur`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `candidature`
--
ALTER TABLE `candidature`
  MODIFY `Id_Candidature` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=88;

--
-- AUTO_INCREMENT pour la table `compétences`
--
ALTER TABLE `compétences`
  MODIFY `Id_competences` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT pour la table `entreprise`
--
ALTER TABLE `entreprise`
  MODIFY `Id_Entreprise` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT pour la table `eval_entreprise`
--
ALTER TABLE `eval_entreprise`
  MODIFY `Id_Eval_entreprise` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=143;

--
-- AUTO_INCREMENT pour la table `offre`
--
ALTER TABLE `offre`
  MODIFY `Id_Offre` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT pour la table `utilisateur`
--
ALTER TABLE `utilisateur`
  MODIFY `Id_Utilisateur` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=49;

--
-- AUTO_INCREMENT pour la table `wishlist`
--
ALTER TABLE `wishlist`
  MODIFY `Id_Wishlist` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=53;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `candidature`
--
ALTER TABLE `candidature`
  ADD CONSTRAINT `candidature_ibfk_1` FOREIGN KEY (`Id_Offre`) REFERENCES `offre` (`Id_Offre`) ON DELETE CASCADE,
  ADD CONSTRAINT `candidature_ibfk_2` FOREIGN KEY (`Id_Utilisateur`) REFERENCES `utilisateur` (`Id_Utilisateur`) ON DELETE CASCADE;

--
-- Contraintes pour la table `eval_entreprise`
--
ALTER TABLE `eval_entreprise`
  ADD CONSTRAINT `eval_entreprise_ibfk_1` FOREIGN KEY (`Id_Utilisateur`) REFERENCES `utilisateur` (`Id_Utilisateur`) ON DELETE CASCADE,
  ADD CONSTRAINT `eval_entreprise_ibfk_2` FOREIGN KEY (`Id_Entreprise`) REFERENCES `entreprise` (`Id_Entreprise`) ON DELETE CASCADE;

--
-- Contraintes pour la table `offre`
--
ALTER TABLE `offre`
  ADD CONSTRAINT `offre_ibfk_1` FOREIGN KEY (`Id_Entreprise`) REFERENCES `entreprise` (`Id_Entreprise`) ON DELETE CASCADE;

--
-- Contraintes pour la table `offre_competences`
--
ALTER TABLE `offre_competences`
  ADD CONSTRAINT `offre_competences_ibfk_1` FOREIGN KEY (`Id_Offre`) REFERENCES `offre` (`Id_Offre`) ON DELETE CASCADE,
  ADD CONSTRAINT `offre_competences_ibfk_2` FOREIGN KEY (`Id_competences`) REFERENCES `compétences` (`Id_competences`) ON DELETE CASCADE;

--
-- Contraintes pour la table `wishlist`
--
ALTER TABLE `wishlist`
  ADD CONSTRAINT `wishlist_ibfk_1` FOREIGN KEY (`Id_Offre`) REFERENCES `offre` (`Id_Offre`) ON DELETE CASCADE,
  ADD CONSTRAINT `wishlist_ibfk_2` FOREIGN KEY (`Id_Utilisateur`) REFERENCES `utilisateur` (`Id_Utilisateur`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
