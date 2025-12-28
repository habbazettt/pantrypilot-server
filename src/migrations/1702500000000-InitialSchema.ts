import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1702500000000 implements MigrationInterface {
  name = 'InitialSchema1702500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Enable uuid-ossp extension if not exists
    await queryRunner.query(`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp"
    `);

    // Create enum type if not exists
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "public"."recipes_difficulty_enum" AS ENUM('easy', 'medium', 'hard');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Create recipes table if not exists
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "recipes" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "title" character varying(255) NOT NULL,
        "description" text,
        "ingredients" text NOT NULL,
        "steps" text NOT NULL,
        "estimatedTime" integer NOT NULL DEFAULT 30,
        "difficulty" "public"."recipes_difficulty_enum" NOT NULL DEFAULT 'medium',
        "safetyNotes" text,
        "tags" text,
        "rating" double precision,
        "ratingCount" integer NOT NULL DEFAULT 0,
        "inputFingerprint" character varying(64),
        "isGenerated" boolean NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_recipes_id" PRIMARY KEY ("id")
      )
    `);

    // Create index if not exists
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_recipes_inputFingerprint" ON "recipes" ("inputFingerprint")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_recipes_inputFingerprint"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "recipes"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."recipes_difficulty_enum"`);
  }
}
