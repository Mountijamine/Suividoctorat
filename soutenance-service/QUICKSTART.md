# Soutenance Service - Quick Start Guide

## Prerequisites

1. **MySQL Server** must be running on `localhost:3306`
2. **Database** `suividoctorat` must exist
3. **Java 17+** installed
4. **Maven** installed

## Starting MySQL

### Windows (Administrator PowerShell):
```powershell
Start-Service MySQL80
```

### Or via Services:
1. Press `Win + R`
2. Type `services.msc`
3. Find "MySQL80"
4. Right-click → Start

### Or via XAMPP/WAMP:
Start MySQL from the control panel

## Create Database (if not exists)

```sql
CREATE DATABASE IF NOT EXISTS suividoctorat CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

## Running the Service

### Option 1: Maven Command Line
```bash
cd D:\SuiviDoc\soutenance-service
mvn spring-boot:run
```

### Option 2: IntelliJ IDEA
1. Open the `soutenance-service` folder
2. Right-click on `SoutenanceApplication.java`
3. Select "Run 'SoutenanceApplication'"

### Option 3: Compiled JAR
```bash
cd D:\SuiviDoc\soutenance-service
mvn clean package
java -jar target/soutenance-service-0.0.1-SNAPSHOT.jar
```

## Verify Service is Running

### Health Check
```bash
curl http://localhost:8096/api/soutenance/health
```

Expected response:
```json
{
  "status": "UP",
  "service": "soutenance-service"
}
```

### Check Statistics
```bash
curl http://localhost:8096/api/soutenance/statistics
```

## Testing the API

### 1. Create a Defense Request

```bash
curl -X POST http://localhost:8096/api/soutenance/demandes \
  -H "Content-Type: application/json" \
  -d '{
    "doctorantEmail": "doctorant@example.com",
    "directeurEmail": "directeur@example.com",
    "titreThese": "Test Thesis Title",
    "resume": "This is a test thesis summary"
  }'
```

### 2. Update Prerequisites

```bash
curl -X PUT http://localhost:8096/api/soutenance/demandes/1/prerequis \
  -H "Content-Type: application/json" \
  -d '{
    "nombrePublications": 3,
    "creditsFormation": 35
  }'
```

### 3. Upload Document

```bash
curl -X POST http://localhost:8096/api/soutenance/demandes/1/documents \
  -F "file=@/path/to/document.pdf" \
  -F "typeDocument=RAPPORT_THESE" \
  -F "description=My thesis report"
```

### 4. Submit Request

```bash
curl -X POST http://localhost:8096/api/soutenance/demandes/1/submit \
  -H "Content-Type: application/json" \
  -d '{
    "doctorantEmail": "doctorant@example.com"
  }'
```

### 5. Get All Requests

```bash
curl http://localhost:8096/api/soutenance/demandes
```

### 6. Get Requests by Doctorant

```bash
curl "http://localhost:8096/api/soutenance/demandes?role=doctorant&email=doctorant@example.com"
```

## Testing with Postman

1. Import the API endpoints from `API.md`
2. Set base URL: `http://localhost:8096`
3. Follow the workflow in order:
   - Create demande
   - Update prerequis
   - Upload documents
   - Submit
   - Admin validates prerequisites
   - Add jury members
   - Submit jury proposal
   - Admin validates jury
   - Rapporteurs submit reports
   - Admin authorizes defense
   - Plan defense
   - Complete defense

## Common Issues

### Error: "Communications link failure"
**Solution**: MySQL is not running. Start MySQL service.

### Error: "Access denied for user 'root'@'localhost'"
**Solution**: Update password in `application.properties`:
```properties
spring.datasource.password=your_mysql_password
```

### Error: "Unknown database 'suividoctorat'"
**Solution**: Create the database:
```sql
CREATE DATABASE suividoctorat;
```

### Error: Port 8096 already in use
**Solution**: Stop other instance or change port in `application.properties`:
```properties
server.port=8097
```

## Configuration

Edit `src/main/resources/application.properties`:

```properties
# Database
spring.datasource.url=jdbc:mysql://localhost:3306/suividoctorat
spring.datasource.username=root
spring.datasource.password=your_password

# Server port
server.port=8096

# File uploads
spring.servlet.multipart.max-file-size=10MB
app.soutenance.upload-dir=./uploads/soutenance

# Business rules
app.soutenance.publications-requises=2
app.soutenance.credits-formation-requis=30
app.soutenance.minimum-rapporteurs=2
```

## Logs

Application logs show:
- SQL queries (if `spring.jpa.show-sql=true`)
- Server startup information
- Request/response details
- Error stack traces

## Database Tables

The service automatically creates these tables:
- `demande_soutenance`
- `prerequis`
- `membre_jury`
- `document_soutenance`

## File Storage

Uploaded files are stored in:
```
./uploads/soutenance/
```

Make sure this directory is writable.

## API Documentation

Full API documentation available in:
- `API.md` - Complete endpoint reference
- `IMPLEMENTATION_SUMMARY.md` - Implementation details

## Support

For complete workflow and business rules, refer to:
1. `API.md` - Endpoint documentation
2. `IMPLEMENTATION_SUMMARY.md` - Implementation details
3. Status flow diagram in `API.md`

## Production Deployment

Before deploying to production:

1. ✅ Change database credentials
2. ✅ Set `spring.jpa.show-sql=false`
3. ✅ Set `spring.jpa.hibernate.ddl-auto=validate`
4. ✅ Configure proper file storage location
5. ✅ Set up database backups
6. ✅ Configure logging
7. ✅ Set up monitoring
8. ✅ Enable HTTPS
9. ✅ Configure CORS properly
10. ✅ Set up authentication/authorization

## Next Steps

1. Start the service
2. Test the API endpoints
3. Integrate with frontend
4. Add authentication
5. Set up notifications
6. Deploy to production
