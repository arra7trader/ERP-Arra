import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3001',
    credentials: true,
  });

  // Global prefix
  app.setGlobalPrefix('api');

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Swagger API Documentation
  const config = new DocumentBuilder()
    .setTitle('PICA ERP API')
    .setDescription('Enterprise Resource Planning System API Documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Auth', 'Authentication endpoints')
    .addTag('Users', 'User management')
    .addTag('CRM - Customers', 'Customer management')
    .addTag('CRM - Leads', 'Lead management')
    .addTag('CRM - Sales Orders', 'Sales order management')
    .addTag('Inventory - Products', 'Product management')
    .addTag('Inventory - Warehouses', 'Warehouse management')
    .addTag('Finance - Invoices', 'Invoice management')
    .addTag('Finance - Expenses', 'Expense management')
    .addTag('HRM - Employees', 'Employee management')
    .addTag('HRM - Attendance', 'Attendance tracking')
    .addTag('HRM - Payroll', 'Payroll management')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 PICA ERP API running on http://localhost:${port}`);
  console.log(`📚 Swagger docs at http://localhost:${port}/api/docs`);
}
bootstrap();
