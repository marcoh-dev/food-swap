import { ClassSerializerInterceptor, ValidationPipe } from "@nestjs/common";
import { NestFactory, Reflector } from "@nestjs/core";
import type { NestExpressApplication } from "@nestjs/platform-express";

import { AppModule } from "./app.module";

const port = process.env.PORT ?? 3000;

async function bootstrap() {
	const app = await NestFactory.create<NestExpressApplication>(AppModule);
	// Render's proxy sits in front of the app; this makes req.ip the client's IP, not Render's
	app.set("trust proxy", 1);
	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
			forbidNonWhitelisted: true,
			transform: true,
			transformOptions: {
				enableImplicitConversion: true,
			},
		}),
	);
	app.useGlobalInterceptors(
		new ClassSerializerInterceptor(app.get(Reflector), {
			excludeExtraneousValues: true,
		}),
	);

	app.enableCors({
		origin: "*",
	});
	await app.listen(port);
	console.log(`http://localhost:${port}`);
}

void bootstrap();
