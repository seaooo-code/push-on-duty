import { config } from "@dotenvx/dotenvx";
import { defineConfig } from "drizzle-kit";

// 加载开发测试环境变量
config({ path: ".env.local", override: true });

export default defineConfig({
	dialect: "mysql",
	dbCredentials: {
		url: process.env.DATABASE_URL as string,
	},
});
