# Mont Célestage - 3D Interactive Platform

## Overview
Mont Célestage is an interactive 3D web platform designed for managing internship offers, students, companies, and pilot supervisors. The platform uses a mountain metaphor with different access points based on user roles (Student, Pilot, Admin), each represented by a different mountain view. The 3D interface provides an engaging way to navigate between different management interfaces.

## Features
- **3D Interactive Mountain Interface**: Navigate through a 3D environment
- **Role-Based Access**: Different experiences for Students, Pilots, and Administrators
- **Internship Management**: Browse and manage internship offers
- **Company Management**: View and manage company listings
- **User Management**: Separate interfaces for managing students and pilots
- **User Authentication**: Secure login system with role-based permissions
- **Wishlist System**: Save favorite internship offers

## Technologies Used
- **Frontend**: HTML5, CSS3, JavaScript
- **3D Rendering**: Three.js with post-processing effects
- **Animation**: GSAP (GreenSock Animation Platform)
- **Build Tool**: Vite
- **Backend**: PHP with MySQL database

## Installation
1. Clone the repository
2. Install Node.js and npm: https://nodejs.org/
3. Install dependencies:
   ```
   npm install
   ```
4. Set up a local web server environment (XAMPP, WAMP, etc.)
5. Place the project files in your web server directory
6.Name the database webdev when you import it in phpmyadmin
## Usage
1. Start the development server:
   ```
   npm run dev
   ```
2. Open your browser and navigate to: http://localhost:5173/
3. Login credentials:
   - Student: mail `clara.chevalier@example.com`, password `Clara888`
   - Pilot: mail `alice.dupont@example.com`, password `Alice1234`
   - Admin: mail `joeswanson@example.com`, password `Etudiant777`

## Navigation
Based on your user role, different parts of the mountain will be accessible:
- **All Users**: Internship offers and companies
- **Pilots and Admins**: Student management
- **Admins Only**: Pilot management

Click on the different parts of the mountain to navigate to the corresponding management screens, or use the popup menu that appears when scrolling down.

## Role Permissions

The platform implements a role-based access control system with three user roles: Administrator, Pilot, and Student. Here's a summary of permissions by role:

### Administrator
Administrators have full access to all system features, including:
- Complete company and internship offer management
- Creation and management of Pilot accounts (exclusive to Admin)
- Student account management
- Access to all statistics and dashboards
- Ability to use the wishlist and application features

### Pilot
Pilots have management capabilities with some restrictions:
- Full company and internship offer management
- Student account management
- No access to Pilot account management (Admin only)
- Access to company and offer statistics
- Cannot use wishlist or application features

### Student
Students have limited permissions focused on internship searches:
- Can search and view companies and internship offers
- Can evaluate companies
- Can view company and offer statistics
- Can use wishlist features and apply to offers
- Cannot create, modify, or delete any accounts, companies, or offers
- No access to student statistics

### Permission Matrix

| Category | Feature | Admin | Pilot | Student |
|----------|---------|-------|-------|---------|
| **Access Management** | SFx1: Authentication | ✓ | ✓ | ✓ |
| **Company Management** | SFx2: Search Companies | ✓ | ✓ | ✓ |
|  | SFx3: Create Company | ✓ | ✓ | ✗ |
|  | SFx4: Modify Company | ✓ | ✓ | ✗ |
|  | SFx5: Rate Company   | ✓ | ✓ | ✓ |
|  | SFx6: Delete Company | ✓ | ✓ | ✗ |
|  | SFx7: View Company Stats | ✓ | ✓ | ✓ |
| **Internship Management** | SFx8: Search Offers | ✓ | ✓ | ✓ |
|  | SFx9: Create Offer  | ✓ | ✓ | ✗ |
|  | SFx10: Modify Offer | ✓ | ✓ | ✗ |
|  | SFx11: Delete Offer | ✓ | ✓ | ✗ |
|  | SFx12: View Offer Stats | ✓ | ✓ | ✓ |
| **Pilot Management** | SFx13: Search Pilots | ✓ | ✗ | ✗ |
|  | SFx14: Create Pilot | ✓ | ✗ | ✗ |
|  | SFx15: Modify Pilot | ✓ | ✗ | ✗ |
|  | SFx16: Delete Pilot | ✓ | ✗ | ✗ |
| **Student Management** | SFx17: Search Students | ✓ | ✓ | ✗ |
|  | SFx18: Create Student | ✓ | ✓ | ✗ |
|  | SFx19: Modify Student | ✓ | ✓ | ✗ |
|  | SFx20: Delete Student | ✓ | ✓ | ✗ |
|  | SFx21: View Student Stats | ✓ | ✓ | ✗ |
| **Application Management** | SFx22: Add to Wishlist | ✓ | ✗ | ✓ |
|  | SFx23: Remove from Wishlist | ✓ | ✗ | ✓ |
|  | SFx24: Apply to Offer       | ✓ | ✗ | ✓ |

## Functional Specifications

### Access Management
- **SFx 1 – Authentication**
  - Description: Allows users to authenticate and gain permissions according to their role
  - Data: [email, password]

### Company Management
- **SFx 2 – Search and Display Companies**
  - Description: Allows users to search for companies based on various criteria, view linked offers and ratings
  - Data: [name, description, contact email/phone, number of applicants, average rating]

- **SFx 3 – Create Company**
  - Description: Allows users to create a company profile
  - Data: [name, description, contact email/phone]

- **SFx 4 – Modify Company**
  - Description: Allows users to modify company information
  - Data: [name, description, contact email/phone]

- **SFx 5 – Rate Company**
  - Description: Allows authorized users to rate companies offering internships
  - Data: [rating]

- **SFx 6 – Delete Company**
  - Description: Allows removal of companies from the system

### Internship Offer Management
- **SFx 8 – Search and Display Offers**
  - Description: Allows users to search for internship offers based on various criteria
  - Data: [company, title, description, skills, base compensation, offer dates, number of applicants]

- **SFx 9 – Create Offer**
  - Description: Allows creation of internship offers
  - Data: [skills, title, description, company, base compensation, offer dates]

- **SFx 10 – Modify Offer**
  - Description: Allows modification of internship offers
  - Data: [skills, title, description, company, base compensation, offer dates]

- **SFx 11 – Delete Offer**
  - Description: Allows removal of offers from the system

- **SFx 12 – View Offer Statistics**
  - Description: Dashboard providing a global view of internships in the database
  - Data: [distribution by skill, by internship duration, top wishlisted offers]

### Pilot Management
- **SFx 13 – Search and Display Pilot Accounts**
  - Description: Allows searching for Pilot accounts
  - Data: [last name, first name]

- **SFx 14 – Create Pilot Account**
  - Description: Allows creation of Pilot accounts
  - Data: [last name, first name]

- **SFx 15 – Modify Pilot Account**
  - Description: Allows modification of Pilot accounts
  - Data: [last name, first name]

- **SFx 16 – Delete Pilot Account**
  - Description: Allows deletion of Pilot accounts

### Student Management
- **SFx 17 – Search and Display Student Accounts**
  - Description: Allows searching for Student accounts and viewing internship search status
  - Data: [last name, first name, email]

- **SFx 18 – Create Student Account**
  - Description: Allows creation of Student accounts
  - Data: [last name, first name, email]

- **SFx 19 – Modify Student Account**
  - Description: Allows modification of Student accounts
  - Data: [last name, first name, email]

- **SFx 20 – Delete Student Account**
  - Description: Allows deletion of Student accounts

- **SFx 21 – View Student Statistics**
  - Description: Allows tracking of a student's internship search
  - Data: [last name, first name, email]

### Application Management
- **SFx 22 – Add Offer to Wishlist**
  - Description: Allows users to add offers to their wishlist for future reference

- **SFx 23 – Remove Offer from Wishlist**
  - Description: Allows users to remove offers from their wishlist

- **SFx 24 – Display Wishlisted Offers**
  - Description: Allows users to view offers in their wishlist

- **SFx 25 – Apply to an Offer**
  - Description: Allows users to submit a cover letter and upload a CV
  - Data: [application date, CV, cover letter]

- **SFx 26 – Display Active Applications**
  - Description: Allows users to view offers they have applied to
  - Data: [company, offer, date, cover letter]

## Page and File Mapping

### Main Pages
- **index.html**: Main 3D interface and entry point with login form (SFx 1)
- **login.php**: Authentication backend (SFx 1)

### Gestion entreprise
- **Gestion_des_entreprises.html**: Company management interface (SFx 2, 3, 4, 6)
- **evaluate_company.php**: Company evaluation interface (SFx 5)
- **entreprises_operations.php**: Backend for company operations
- **get_entreprises.php**: API for retrieving company data
- **manage_entreprise.php**: API for company CRUD operations

### Gestion offre
- **Gestion_offres.html**: Offer management interface (SFx 8, 9, 10, 11, 12)
- **offres_operations.php**: Backend for offer operations

### Gestion_pilote
- **Gestion_pilote.html**: Pilot account management (SFx 13, 14, 15, 16)
- **api_gestion_pilote.php**: API for pilot CRUD operations

### Gestion etudiant
- **Gestion_etudiant.html**: Student account management (SFx 17, 18, 19, 20, 21)
- **api_gestion_etudiant.php**: API for student CRUD operations

### Application Features
- **src/profile.js**: Controls the wishlist functionality (SFx 22, 23, 24)
- **Gestion_offres.html**: Also contains application features (SFx 25, 26)

### Support Files
- **src/main.js**: 3D scene rendering and navigation
- **src/style.css**: Global styling
- **check_auth.php**: Authentication verification
- **check_session.php**: Session management
- **get_user_data.php**: User data retrieval

## Project Structure
- `/src`: JavaScript source files, including 3D rendering and animations
- `/public`: Static assets
- `/app`: Application components
- `/config`: Configuration files
- `/api`: API endpoints
- `/uploads`: User uploaded files
- `*.html`: Main interface pages
- `*.php`: Backend API and processing files

## Development
The project uses Vite for fast development and building:
- `npm run dev`: Start the development server
- `npm run build`: Build for production
- `npm run preview`: Preview the production build

## Credits
Mont Célestage was developed as a unique approach to educational management systems, using 3D technology to create an engaging user experience. 
