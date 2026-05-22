import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Initial schema for Milk Management System.
 * Creates all 15 tables documented in docs/04-Database-Structure.md, including
 * ENUMs, indexes, generated columns, and the updated_at trigger.
 */
export class InitialSchema1700000000000 implements MigrationInterface {
  name = 'InitialSchema1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);

    // ────────────── ENUM types ──────────────
    await queryRunner.query(`
      CREATE TYPE user_role        AS ENUM ('seller','buyer','admin');
      CREATE TYPE user_theme       AS ENUM ('system','light','dark');
      CREATE TYPE customer_status  AS ENUM ('active','paused','due_payment','archived');
      CREATE TYPE delivery_type    AS ENUM ('morning','evening','both');
      CREATE TYPE delivery_slot    AS ENUM ('morning','evening');
      CREATE TYPE delivery_status  AS ENUM ('pending','delivered','missed','partial','extra');
      CREATE TYPE product_type     AS ENUM ('cow','buffalo','toned','custom');
      CREATE TYPE product_unit     AS ENUM ('liter','ml','kg','piece');
      CREATE TYPE billing_cycle    AS ENUM ('monthly','weekly');
      CREATE TYPE bill_status      AS ENUM ('draft','pending','partial','paid','overdue','void');
      CREATE TYPE payment_method   AS ENUM (
        'cash','upi','google_pay','phonepe','paytm',
        'debit_card','credit_card','net_banking','bank_transfer','adjustment'
      );
      CREATE TYPE payment_status   AS ENUM ('pending','success','failed','refunded');
      CREATE TYPE schedule_type    AS ENUM ('pause','vacation','extra_request','resume');
      CREATE TYPE complaint_cat    AS ENUM ('delivery','billing','quantity','other');
      CREATE TYPE complaint_status AS ENUM ('open','in_progress','resolved','rejected');
      CREATE TYPE notif_channel    AS ENUM ('push','sms','whatsapp');
      CREATE TYPE platform_kind    AS ENUM ('android','ios');
    `);

    // ────────────── updated_at trigger ──────────────
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION trg_set_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = now();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    // ────────────── users ──────────────
    await queryRunner.query(`
      CREATE TABLE users (
        id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        role            user_role NOT NULL,
        name            varchar(120),
        phone           varchar(15) NOT NULL UNIQUE,
        email           varchar(160) UNIQUE,
        password_hash   text,
        photo_url       text,
        language        varchar(8)  NOT NULL DEFAULT 'en',
        theme           user_theme  NOT NULL DEFAULT 'system',
        fcm_token       text,
        is_active       boolean     NOT NULL DEFAULT true,
        last_login_at   timestamptz,
        created_at      timestamptz NOT NULL DEFAULT now(),
        updated_at      timestamptz NOT NULL DEFAULT now(),
        deleted_at      timestamptz
      );
      CREATE INDEX idx_users_role  ON users(role);
      CREATE TRIGGER users_set_updated_at
        BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION trg_set_updated_at();
    `);

    // ────────────── sellers ──────────────
    await queryRunner.query(`
      CREATE TABLE sellers (
        id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id             uuid NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        business_name       varchar(160) NOT NULL,
        address             text,
        gst_number          varchar(20),
        lat                 numeric(10,7),
        lng                 numeric(10,7),
        currency            varchar(3)  NOT NULL DEFAULT 'INR',
        timezone            varchar(64) NOT NULL DEFAULT 'Asia/Kolkata',
        billing_cycle_day   smallint    NOT NULL DEFAULT 1,
        default_milk_rate   numeric(10,2),
        invite_code         varchar(8) UNIQUE,
        created_at          timestamptz NOT NULL DEFAULT now(),
        updated_at          timestamptz NOT NULL DEFAULT now()
      );
      CREATE TRIGGER sellers_set_updated_at
        BEFORE UPDATE ON sellers FOR EACH ROW EXECUTE FUNCTION trg_set_updated_at();
    `);

    // ────────────── buyers ──────────────
    await queryRunner.query(`
      CREATE TABLE buyers (
        id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id           uuid NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        default_address   text,
        created_at        timestamptz NOT NULL DEFAULT now(),
        updated_at        timestamptz NOT NULL DEFAULT now()
      );
      CREATE TRIGGER buyers_set_updated_at
        BEFORE UPDATE ON buyers FOR EACH ROW EXECUTE FUNCTION trg_set_updated_at();
    `);

    // ────────────── products ──────────────
    await queryRunner.query(`
      CREATE TABLE products (
        id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        seller_id       uuid REFERENCES sellers(id) ON DELETE CASCADE,
        name            varchar(80) NOT NULL,
        type            product_type NOT NULL DEFAULT 'cow',
        unit            product_unit NOT NULL DEFAULT 'liter',
        default_rate    numeric(10,2) NOT NULL,
        image_url       text,
        is_active       boolean NOT NULL DEFAULT true,
        created_at      timestamptz NOT NULL DEFAULT now(),
        updated_at      timestamptz NOT NULL DEFAULT now()
      );
      CREATE INDEX idx_products_seller ON products(seller_id) WHERE seller_id IS NOT NULL;
      CREATE TRIGGER products_set_updated_at
        BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION trg_set_updated_at();
    `);

    // ────────────── customers ──────────────
    await queryRunner.query(`
      CREATE TABLE customers (
        id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        seller_id           uuid NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
        buyer_id            uuid REFERENCES buyers(id) ON DELETE SET NULL,
        name                varchar(120) NOT NULL,
        phone               varchar(15)  NOT NULL,
        alt_phone           varchar(15),
        address             text,
        lat                 numeric(10,7),
        lng                 numeric(10,7),
        delivery_type       delivery_type NOT NULL DEFAULT 'morning',
        morning_quantity    numeric(8,3) NOT NULL DEFAULT 0,
        evening_quantity    numeric(8,3) NOT NULL DEFAULT 0,
        milk_rate           numeric(10,2),
        product_id          uuid REFERENCES products(id) ON DELETE SET NULL,
        billing_cycle       billing_cycle NOT NULL DEFAULT 'monthly',
        billing_start_date  date,
        status              customer_status NOT NULL DEFAULT 'active',
        linked_at           timestamptz,
        created_at          timestamptz NOT NULL DEFAULT now(),
        updated_at          timestamptz NOT NULL DEFAULT now(),
        deleted_at          timestamptz,
        CONSTRAINT uq_customers_seller_phone UNIQUE (seller_id, phone)
      );
      CREATE INDEX idx_customers_seller_status ON customers(seller_id, status);
      CREATE INDEX idx_customers_buyer         ON customers(buyer_id) WHERE buyer_id IS NOT NULL;
      CREATE TRIGGER customers_set_updated_at
        BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION trg_set_updated_at();
    `);

    // ────────────── deliveries ──────────────
    await queryRunner.query(`
      CREATE TABLE deliveries (
        id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        seller_id             uuid NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
        customer_id           uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
        product_id            uuid REFERENCES products(id) ON DELETE SET NULL,
        delivery_date         date NOT NULL,
        slot                  delivery_slot NOT NULL,
        expected_quantity     numeric(8,3) NOT NULL,
        delivered_quantity    numeric(8,3),
        unit_rate             numeric(10,2) NOT NULL,
        status                delivery_status NOT NULL DEFAULT 'pending',
        notes                 text,
        marked_by_user_id     uuid REFERENCES users(id) ON DELETE SET NULL,
        marked_at             timestamptz,
        created_at            timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT uq_deliveries UNIQUE (customer_id, delivery_date, slot)
      );
      CREATE INDEX idx_deliveries_seller_date ON deliveries(seller_id, delivery_date, slot);
      CREATE INDEX idx_deliveries_customer    ON deliveries(customer_id, delivery_date DESC);
    `);

    // ────────────── schedule_changes ──────────────
    await queryRunner.query(`
      CREATE TABLE schedule_changes (
        id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        customer_id         uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
        type                schedule_type NOT NULL,
        from_date           date,
        to_date             date,
        extra_quantity      numeric(8,3),
        extra_slot          delivery_slot,
        reason              text,
        created_by_role     user_role NOT NULL,
        created_by_user_id  uuid REFERENCES users(id) ON DELETE SET NULL,
        created_at          timestamptz NOT NULL DEFAULT now()
      );
      CREATE INDEX idx_schedule_customer ON schedule_changes(customer_id, from_date, to_date);
    `);

    // ────────────── bills ──────────────
    await queryRunner.query(`
      CREATE TABLE bills (
        id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        bill_number     varchar(20) NOT NULL UNIQUE,
        seller_id       uuid NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
        customer_id     uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
        period_start    date NOT NULL,
        period_end      date NOT NULL,
        subtotal        numeric(12,2) NOT NULL DEFAULT 0,
        tax_amount      numeric(12,2) NOT NULL DEFAULT 0,
        discount        numeric(12,2) NOT NULL DEFAULT 0,
        total_amount    numeric(12,2) NOT NULL DEFAULT 0,
        paid_amount     numeric(12,2) NOT NULL DEFAULT 0,
        balance         numeric(12,2) GENERATED ALWAYS AS (total_amount - paid_amount) STORED,
        due_date        date,
        status          bill_status   NOT NULL DEFAULT 'draft',
        pdf_url         text,
        generated_at    timestamptz,
        created_at      timestamptz NOT NULL DEFAULT now(),
        updated_at      timestamptz NOT NULL DEFAULT now()
      );
      CREATE INDEX idx_bills_seller_status ON bills(seller_id, status, due_date);
      CREATE INDEX idx_bills_customer      ON bills(customer_id, period_end DESC);
      CREATE TRIGGER bills_set_updated_at
        BEFORE UPDATE ON bills FOR EACH ROW EXECUTE FUNCTION trg_set_updated_at();
    `);

    // ────────────── bill_items ──────────────
    await queryRunner.query(`
      CREATE TABLE bill_items (
        id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        bill_id         uuid NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
        delivery_date   date NOT NULL,
        slot            delivery_slot NOT NULL,
        product_id      uuid REFERENCES products(id) ON DELETE SET NULL,
        quantity        numeric(8,3) NOT NULL,
        unit_rate       numeric(10,2) NOT NULL,
        line_total      numeric(12,2) NOT NULL
      );
      CREATE INDEX idx_bill_items_bill ON bill_items(bill_id);
    `);

    // ────────────── payments ──────────────
    await queryRunner.query(`
      CREATE TABLE payments (
        id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        seller_id             uuid NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
        customer_id           uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
        bill_id               uuid REFERENCES bills(id) ON DELETE SET NULL,
        amount                numeric(12,2) NOT NULL,
        method                payment_method NOT NULL,
        reference             varchar(80),
        gateway               varchar(40),
        gateway_order_id      varchar(80),
        gateway_payment_id    varchar(80),
        status                payment_status NOT NULL DEFAULT 'pending',
        recorded_by_user_id   uuid REFERENCES users(id) ON DELETE SET NULL,
        paid_at               timestamptz,
        created_at            timestamptz NOT NULL DEFAULT now()
      );
      CREATE INDEX idx_payments_seller_paidat ON payments(seller_id, paid_at DESC);
      CREATE INDEX idx_payments_bill          ON payments(bill_id) WHERE bill_id IS NOT NULL;
      CREATE INDEX idx_payments_gateway       ON payments(gateway_payment_id) WHERE gateway_payment_id IS NOT NULL;
    `);

    // ────────────── complaints ──────────────
    await queryRunner.query(`
      CREATE TABLE complaints (
        id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        customer_id         uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
        seller_id           uuid NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
        category            complaint_cat NOT NULL,
        description         text,
        photo_url           text,
        delivery_id         uuid REFERENCES deliveries(id) ON DELETE SET NULL,
        bill_id             uuid REFERENCES bills(id) ON DELETE SET NULL,
        status              complaint_status NOT NULL DEFAULT 'open',
        resolution_note     text,
        resolved_at         timestamptz,
        created_at          timestamptz NOT NULL DEFAULT now(),
        updated_at          timestamptz NOT NULL DEFAULT now()
      );
      CREATE INDEX idx_complaints_seller_status ON complaints(seller_id, status, created_at DESC);
      CREATE TRIGGER complaints_set_updated_at
        BEFORE UPDATE ON complaints FOR EACH ROW EXECUTE FUNCTION trg_set_updated_at();
    `);

    // ────────────── notifications_log ──────────────
    await queryRunner.query(`
      CREATE TABLE notifications_log (
        id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id         uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        type            varchar(40) NOT NULL,
        channel         notif_channel NOT NULL DEFAULT 'push',
        title           varchar(120),
        body            text,
        data            jsonb,
        is_read         boolean NOT NULL DEFAULT false,
        sent_at         timestamptz NOT NULL DEFAULT now()
      );
      CREATE INDEX idx_notifications_user ON notifications_log(user_id, sent_at DESC);
    `);

    // ────────────── business_settings ──────────────
    await queryRunner.query(`
      CREATE TABLE business_settings (
        id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        seller_id             uuid NOT NULL UNIQUE REFERENCES sellers(id) ON DELETE CASCADE,
        enable_push           boolean NOT NULL DEFAULT true,
        enable_sms            boolean NOT NULL DEFAULT true,
        enable_whatsapp       boolean NOT NULL DEFAULT false,
        auto_backup_enabled   boolean NOT NULL DEFAULT true,
        payment_gateways      jsonb,
        last_backup_at        timestamptz
      );
    `);

    // ────────────── audit_log ──────────────
    await queryRunner.query(`
      CREATE TABLE audit_log (
        id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        actor_user_id   uuid REFERENCES users(id) ON DELETE SET NULL,
        action          varchar(60) NOT NULL,
        entity_type     varchar(40) NOT NULL,
        entity_id       uuid,
        before          jsonb,
        after           jsonb,
        created_at      timestamptz NOT NULL DEFAULT now()
      );
      CREATE INDEX idx_audit_entity ON audit_log(entity_type, entity_id, created_at DESC);
    `);

    // ────────────── device_sessions ──────────────
    await queryRunner.query(`
      CREATE TABLE device_sessions (
        id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id             uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        device_id           text,
        platform            platform_kind,
        app_version         varchar(20),
        refresh_token_hash  text,
        expires_at          timestamptz
      );
      CREATE INDEX idx_device_user ON device_sessions(user_id);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop in reverse dependency order.
    await queryRunner.query(`
      DROP TABLE IF EXISTS device_sessions       CASCADE;
      DROP TABLE IF EXISTS audit_log             CASCADE;
      DROP TABLE IF EXISTS business_settings     CASCADE;
      DROP TABLE IF EXISTS notifications_log     CASCADE;
      DROP TABLE IF EXISTS complaints            CASCADE;
      DROP TABLE IF EXISTS payments              CASCADE;
      DROP TABLE IF EXISTS bill_items            CASCADE;
      DROP TABLE IF EXISTS bills                 CASCADE;
      DROP TABLE IF EXISTS schedule_changes      CASCADE;
      DROP TABLE IF EXISTS deliveries            CASCADE;
      DROP TABLE IF EXISTS customers             CASCADE;
      DROP TABLE IF EXISTS products              CASCADE;
      DROP TABLE IF EXISTS buyers                CASCADE;
      DROP TABLE IF EXISTS sellers               CASCADE;
      DROP TABLE IF EXISTS users                 CASCADE;

      DROP FUNCTION IF EXISTS trg_set_updated_at;

      DROP TYPE IF EXISTS platform_kind;
      DROP TYPE IF EXISTS notif_channel;
      DROP TYPE IF EXISTS complaint_status;
      DROP TYPE IF EXISTS complaint_cat;
      DROP TYPE IF EXISTS schedule_type;
      DROP TYPE IF EXISTS payment_status;
      DROP TYPE IF EXISTS payment_method;
      DROP TYPE IF EXISTS bill_status;
      DROP TYPE IF EXISTS billing_cycle;
      DROP TYPE IF EXISTS product_unit;
      DROP TYPE IF EXISTS product_type;
      DROP TYPE IF EXISTS delivery_status;
      DROP TYPE IF EXISTS delivery_slot;
      DROP TYPE IF EXISTS delivery_type;
      DROP TYPE IF EXISTS customer_status;
      DROP TYPE IF EXISTS user_theme;
      DROP TYPE IF EXISTS user_role;
    `);
  }
}
