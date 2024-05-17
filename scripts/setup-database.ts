import { createConnection } from 'typeorm';

const createSchemaAndTables = async () => {
  const connection = await createConnection();
  const queryRunner = connection.createQueryRunner();

  try {
    // Start a transaction
    await queryRunner.startTransaction();

    // Execute the SQL script to create schema, tables, and types
    await queryRunner.query(`

    -- Schema: pgboss
    CREATE SCHEMA IF NOT EXISTS pgboss AUTHORIZATION postgres;


    -- Type: job_state 
    DO $$
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'job_state') THEN
                -- Create the type
                CREATE TYPE pgboss.job_state AS ENUM
                    ('created', 'retry', 'active', 'completed', 'expired', 'cancelled', 'failed');
                -- Alter the owner
                ALTER TYPE pgboss.job_state OWNER TO postgres;
        END IF;
    END $$;


    
    -- Table: pgboss.version

    DROP TABLE IF EXISTS pgboss.version;
    
    CREATE TABLE IF NOT EXISTS pgboss.version
    (
        version integer NOT NULL,
        CONSTRAINT version_pkey PRIMARY KEY (version)
    )
    
    TABLESPACE pg_default;
    
    ALTER TABLE IF EXISTS pgboss.version
        OWNER to postgres;



    -- Table: pgboss.archive

    DROP TABLE IF EXISTS pgboss.archive;
    
    CREATE TABLE IF NOT EXISTS pgboss.archive
    (
        id uuid NOT NULL,
        name text COLLATE pg_catalog."default" NOT NULL,
        priority integer NOT NULL,
        data jsonb,
        state pgboss.job_state NOT NULL,
        retrylimit integer NOT NULL,
        retrycount integer NOT NULL,
        retrydelay integer NOT NULL,
        retrybackoff boolean NOT NULL,
        startafter timestamp with time zone NOT NULL,
        startedon timestamp with time zone,
        singletonkey text COLLATE pg_catalog."default",
        singletonon timestamp without time zone,
        expirein interval NOT NULL,
        createdon timestamp with time zone NOT NULL,
        completedon timestamp with time zone,
        keepuntil timestamp with time zone NOT NULL,
        archivedon timestamp with time zone NOT NULL DEFAULT now()
    )
    
    TABLESPACE pg_default;
    
    ALTER TABLE IF EXISTS pgboss.archive
        OWNER to postgres;

    -- Index: archive_archivedon_idx
    
    DROP INDEX IF EXISTS pgboss.archive_archivedon_idx;
    
    CREATE INDEX IF NOT EXISTS archive_archivedon_idx
        ON pgboss.archive USING btree
        (archivedon ASC NULLS LAST)
        TABLESPACE pg_default;

    -- Index: archive_id_idx
    
    DROP INDEX IF EXISTS pgboss.archive_id_idx;
    
    CREATE INDEX IF NOT EXISTS archive_id_idx
        ON pgboss.archive USING btree
        (id ASC NULLS LAST)
        TABLESPACE pg_default;


    
    -- Table: pgboss.schedule

    DROP TABLE IF EXISTS pgboss.schedule;
    
    CREATE TABLE IF NOT EXISTS pgboss.schedule
    (
        name text COLLATE pg_catalog."default" NOT NULL,
        cron text COLLATE pg_catalog."default" NOT NULL,
        timezone text COLLATE pg_catalog."default",
        data jsonb,
        options jsonb,
        created_on timestamp with time zone NOT NULL DEFAULT now(),
        updated_on timestamp with time zone NOT NULL DEFAULT now(),
        CONSTRAINT schedule_pkey PRIMARY KEY (name)
    )
    
    TABLESPACE pg_default;
    
    ALTER TABLE IF EXISTS pgboss.schedule
        OWNER to postgres;
    
    -- Table: pgboss.job
    
    DROP TABLE IF EXISTS pgboss.job;
    
    CREATE TABLE IF NOT EXISTS pgboss.job
    (
        id uuid NOT NULL DEFAULT gen_random_uuid(),
        name text COLLATE pg_catalog."default" NOT NULL,
        priority integer NOT NULL DEFAULT 0,
        data jsonb,
        state pgboss.job_state NOT NULL DEFAULT 'created'::pgboss.job_state,
        retrylimit integer NOT NULL DEFAULT 0,
        retrycount integer NOT NULL DEFAULT 0,
        retrydelay integer NOT NULL DEFAULT 0,
        retrybackoff boolean NOT NULL DEFAULT false,
        startafter timestamp with time zone NOT NULL DEFAULT now(),
        startedon timestamp with time zone,
        singletonkey text COLLATE pg_catalog."default",
        singletonon timestamp without time zone,
        expirein interval NOT NULL DEFAULT '00:15:00'::interval,
        createdon timestamp with time zone NOT NULL DEFAULT now(),
        completedon timestamp with time zone,
        keepuntil timestamp with time zone NOT NULL DEFAULT (now() + '14 days'::interval),
        CONSTRAINT job_pkey PRIMARY KEY (id)
    )
    
    TABLESPACE pg_default;
    
    ALTER TABLE IF EXISTS pgboss.job
        OWNER to postgres;


    -- Index: job_fetch
    
    DROP INDEX IF EXISTS pgboss.job_fetch;
    
    CREATE INDEX IF NOT EXISTS job_fetch
        ON pgboss.job USING btree
        (name COLLATE pg_catalog."default" text_pattern_ops ASC NULLS LAST, startafter ASC NULLS LAST)
        TABLESPACE pg_default
        WHERE state < 'active'::pgboss.job_state;


    -- Index: job_name
    
    DROP INDEX IF EXISTS pgboss.job_name;
    
    CREATE INDEX IF NOT EXISTS job_name
        ON pgboss.job USING btree
        (name COLLATE pg_catalog."default" text_pattern_ops ASC NULLS LAST)
        TABLESPACE pg_default;


    -- Index: job_singletonkey
    
    DROP INDEX IF EXISTS pgboss.job_singletonkey;
    
    CREATE UNIQUE INDEX IF NOT EXISTS job_singletonkey
        ON pgboss.job USING btree
        (name COLLATE pg_catalog."default" ASC NULLS LAST, singletonkey COLLATE pg_catalog."default" ASC NULLS LAST)
        TABLESPACE pg_default
        WHERE state < 'completed'::pgboss.job_state AND singletonon IS NULL AND NOT singletonkey ~~ '\_\_pgboss\_\_singleton\_queue%'::text;
    
    
    -- Index: job_singletonkeyon
    
    DROP INDEX IF EXISTS pgboss.job_singletonkeyon;
    
    CREATE UNIQUE INDEX IF NOT EXISTS job_singletonkeyon
        ON pgboss.job USING btree
        (name COLLATE pg_catalog."default" ASC NULLS LAST, singletonon ASC NULLS LAST, singletonkey COLLATE pg_catalog."default" ASC NULLS LAST)
        TABLESPACE pg_default
        WHERE state < 'expired'::pgboss.job_state;
    
    
    -- Index: job_singletonon
    
    DROP INDEX IF EXISTS pgboss.job_singletonon;
    
    CREATE UNIQUE INDEX IF NOT EXISTS job_singletonon
        ON pgboss.job USING btree
        (name COLLATE pg_catalog."default" ASC NULLS LAST, singletonon ASC NULLS LAST)
        TABLESPACE pg_default
        WHERE state < 'expired'::pgboss.job_state AND singletonkey IS NULL;
    `);

    // Commit the transaction
    await queryRunner.commitTransaction();
  } catch (error) {
    // Rollback transaction in case of error
    await queryRunner.rollbackTransaction();
    console.error('Error creating schema and tables:', error);
  } finally {
    // Release the query runner
    await queryRunner.release();
    // Close the connection
    await connection.close();
  }
};

// Execute the function
createSchemaAndTables().catch((error) =>
  console.error('Error in setup script:', error),
);
