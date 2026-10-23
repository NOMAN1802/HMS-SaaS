-- CreateTable
CREATE TABLE "role" (
    "tenant_id" UUID NOT NULL,
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name_en" TEXT NOT NULL,
    "name_bn" TEXT,
    "template_code" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_permission" (
    "tenant_id" UUID NOT NULL,
    "role_id" UUID NOT NULL,
    "permission_code" TEXT NOT NULL,

    CONSTRAINT "role_permission_pkey" PRIMARY KEY ("tenant_id","role_id","permission_code")
);

-- CreateTable
CREATE TABLE "membership_role" (
    "tenant_id" UUID NOT NULL,
    "membership_id" UUID NOT NULL,
    "role_id" UUID NOT NULL,

    CONSTRAINT "membership_role_pkey" PRIMARY KEY ("tenant_id","membership_id","role_id")
);

-- CreateTable
CREATE TABLE "tenant_entitlement" (
    "tenant_id" UUID NOT NULL,
    "module_code" TEXT NOT NULL,
    "enabled_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tenant_entitlement_pkey" PRIMARY KEY ("tenant_id","module_code")
);

-- CreateIndex
CREATE UNIQUE INDEX "role_tenant_id_id_key" ON "role"("tenant_id", "id");

-- CreateIndex
CREATE UNIQUE INDEX "role_tenant_id_code_key" ON "role"("tenant_id", "code");

-- CreateIndex
CREATE INDEX "membership_role_tenant_id_role_id_idx" ON "membership_role"("tenant_id", "role_id");

-- AddForeignKey
ALTER TABLE "role" ADD CONSTRAINT "role_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permission" ADD CONSTRAINT "role_permission_tenant_id_role_id_fkey" FOREIGN KEY ("tenant_id", "role_id") REFERENCES "role"("tenant_id", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "membership_role" ADD CONSTRAINT "membership_role_tenant_id_membership_id_fkey" FOREIGN KEY ("tenant_id", "membership_id") REFERENCES "membership"("tenant_id", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "membership_role" ADD CONSTRAINT "membership_role_tenant_id_role_id_fkey" FOREIGN KEY ("tenant_id", "role_id") REFERENCES "role"("tenant_id", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_entitlement" ADD CONSTRAINT "tenant_entitlement_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;


-- ============================================================================
-- Hand-written: rules Prisma does not model (T-ACC-02, ADR-003, FR-SAA-004).
-- ============================================================================

-- Codes are checked against the catalogue in @hms/contracts by the application; the database
-- only refuses malformed values, so a typo cannot hide as a grant nobody can match.
ALTER TABLE hms.role_permission
  ADD CONSTRAINT role_permission_code_format CHECK (permission_code ~ '^[a-z_]+(\.[a-z_]+)+$');
ALTER TABLE hms.tenant_entitlement
  ADD CONSTRAINT tenant_entitlement_module_format CHECK (module_code ~ '^[a-z]+$');

-- Normal tenant isolation for every new tenant-owned table.
ALTER TABLE hms.role ENABLE ROW LEVEL SECURITY;
ALTER TABLE hms.role FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON hms.role
  USING (tenant_id = hms.current_tenant_id())
  WITH CHECK (tenant_id = hms.current_tenant_id());

ALTER TABLE hms.role_permission ENABLE ROW LEVEL SECURITY;
ALTER TABLE hms.role_permission FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON hms.role_permission
  USING (tenant_id = hms.current_tenant_id())
  WITH CHECK (tenant_id = hms.current_tenant_id());

ALTER TABLE hms.membership_role ENABLE ROW LEVEL SECURITY;
ALTER TABLE hms.membership_role FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON hms.membership_role
  USING (tenant_id = hms.current_tenant_id())
  WITH CHECK (tenant_id = hms.current_tenant_id());

ALTER TABLE hms.tenant_entitlement ENABLE ROW LEVEL SECURITY;
ALTER TABLE hms.tenant_entitlement FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON hms.tenant_entitlement
  USING (tenant_id = hms.current_tenant_id())
  WITH CHECK (tenant_id = hms.current_tenant_id());
