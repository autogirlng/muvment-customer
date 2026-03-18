"use client";
import { OrganizationService } from "@/controllers/organization/Organization.service";
import {
  ApiKey,
  OrganizationKYC,
  OrganizationKYCStatus,
} from "@/types/Organization.type";
import Link from "next/link";
import { useState, useEffect } from "react";
import {
  MdKey,
  MdRefresh,
  MdContentCopy,
  MdCheck,
  MdWarning,
  MdAdd,
  MdClose,
  MdLock,
} from "react-icons/md";

interface KeyRevealModalProps {
  rawKey: string;
  onClose: () => void;
}
const STATUS_CONFIG = {
  NOT_SUBMITTED: {
    label: "Not Submitted",
    classes: "bg-gray-100 text-gray-700 border-gray-200",
  },
  UNDER_REVIEW: {
    label: "Under Review",
    classes: "bg-blue-100 text-blue-700 border-blue-200",
  },
  APPROVED: {
    label: "Approved",
    classes: "bg-emerald-100 text-emerald-800 border-emerald-200",
  },
  REJECTED: {
    label: "Rejected",
    classes: "bg-rose-100 text-rose-700 border-rose-200",
  },
};

const KeyRevealModal = ({ rawKey, onClose }: KeyRevealModalProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(rawKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 z-10">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <MdClose className="w-5 h-5" />
        </button>

        <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center mb-4">
          <MdLock className="w-6 h-6 text-amber-500" />
        </div>

        <h2 className="text-lg font-bold text-gray-900 mb-1">
          Save Your API Key
        </h2>
        <p className="text-sm text-gray-500 mb-5 leading-relaxed">
          This is the{" "}
          <span className="font-semibold text-gray-700">only time</span> you
          will see this key. Copy and store it somewhere safe — it cannot be
          retrieved again.
        </p>

        {/* Key display */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-4">
          <p className="text-xs text-gray-400 mb-1.5 font-medium">API Key</p>
          <code className="text-sm text-gray-800 font-mono break-all leading-relaxed">
            {rawKey}
          </code>
        </div>

        {/* Warning */}
        <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-5">
          <MdWarning className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700 leading-relaxed">
            After closing this dialog, the full key will no longer be visible.
            Make sure you've copied it before proceeding.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleCopy}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors"
          >
            {copied ? (
              <>
                <MdCheck className="w-4 h-4" /> Copied!
              </>
            ) : (
              <>
                <MdContentCopy className="w-4 h-4" /> Copy Key
              </>
            )}
          </button>
          <button
            onClick={onClose}
            className="px-5 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

const maskKey = (key: ApiKey) => `${key.prefix}${"*".repeat(24)}${key.last4}`;

interface KeyRowProps {
  label: string;
  environment: "TEST" | "LIVE";
  apiKey: ApiKey | undefined;
  orgId: string;
  onKeyUpdate: (environment: "TEST" | "LIVE", newKey: ApiKey) => void;
  kycStatus?: OrganizationKYCStatus;
}

const KeyRow = ({
  label,
  environment,
  apiKey,
  orgId,
  onKeyUpdate,
  kycStatus,
}: KeyRowProps) => {
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [revealKey, setRevealKey] = useState<string | null>(null);

  const handleGenerate = async () => {
    try {
      setLoading(true);
      const created = await OrganizationService.generateApiKey(orgId, {
        name: `${environment} Key`,
        environment,
      });
      if (created) {
        onKeyUpdate(environment, created);
        if (created.rawApiKey) setRevealKey(created.rawApiKey);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = async () => {
    if (!apiKey) return;
    try {
      setLoading(true);
      setShowConfirm(false);
      const created = await OrganizationService.regenerateApiKey(
        orgId,
        apiKey.id,
        environment,
      );
      if (created) {
        onKeyUpdate(environment, created);
        if (created.rawApiKey) setRevealKey(created.rawApiKey);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const envBadge =
    environment === "TEST" ? (
      <span className="text-xs font-medium bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full">
        TEST
      </span>
    ) : (
      <span className="text-xs font-medium bg-green-50 text-green-700 px-2 py-0.5 rounded-full">
        LIVE
      </span>
    );

  return (
    <>
      {revealKey && (
        <KeyRevealModal rawKey={revealKey} onClose={() => setRevealKey(null)} />
      )}

      <div className="border border-gray-200 rounded-2xl p-5 bg-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <MdKey className="w-5 h-5 text-gray-400" />
            <span className="font-medium text-gray-800 text-sm">{label}</span>
            {envBadge}
          </div>

          {apiKey ? (
            showConfirm ? (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                <MdWarning className="w-4 h-4 text-red-500 flex-shrink-0" />
                <span className="text-xs text-red-600 font-medium">
                  This will revoke the current key.
                </span>
                <button
                  onClick={handleRegenerate}
                  disabled={loading}
                  className="text-xs bg-red-500 text-white px-2.5 py-1 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-60 ml-1"
                >
                  Confirm
                </button>
                <button
                  onClick={() => setShowConfirm(false)}
                  className="text-xs text-gray-500 hover:text-gray-700 px-1"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowConfirm(true)}
                disabled={loading}
                className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-blue-600 border border-gray-200 hover:border-blue-300 px-3 py-1.5 rounded-lg transition-colors"
              >
                <MdRefresh
                  className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
                />
                Regenerate
              </button>
            )
          ) : // generate api key if environment is testing
          environment === "TEST" ? (
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="flex items-center cursor-pointer gap-1.5 text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60"
            >
              <MdAdd className="w-3.5 h-3.5" />
              {loading ? "Generating..." : "Generate Key"}
            </button>
          ) : (
            <div>
              {kycStatus !== "APPROVED" && (
                <span className="text-red-400 text-xs">KYC Incomplete</span>
              )}
              <button
                onClick={handleGenerate}
                disabled={loading || kycStatus !== "APPROVED"}
                className="flex items-center  text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60"
              >
                <MdAdd className="w-3.5 h-3.5" />
                {loading ? "Generating..." : "Generate Key"}
              </button>
            </div>
          )}
        </div>

        {apiKey ? (
          <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
            <code className="text-xs text-gray-500 font-mono tracking-wide">
              {maskKey(apiKey)}
            </code>
            <span className="text-xs text-gray-400 italic ml-3 flex-shrink-0">
              Key hidden for security
            </span>
          </div>
        ) : (
          <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl px-4 py-5 text-center">
            <p className="text-sm text-gray-400">
              No key found. Generate your first{" "}
              <span className="font-medium text-gray-600">
                {environment === "TEST" ? "test" : "live"}
              </span>{" "}
              key above.
            </p>
          </div>
        )}
      </div>
    </>
  );
};

interface ApiConfigurationTabProps {
  orgId: string;
}

export const ApiConfigurationTab = ({ orgId }: ApiConfigurationTabProps) => {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [kyc, setKYC] = useState<OrganizationKYC>();
  const [loading, setLoading] = useState(true);
  const environment = process.env.NEXT_PUBLIC_ENVIRONMENT;

  useEffect(() => {
    if (!orgId) return;
    OrganizationService.getApiKeys(orgId)
      .then(setKeys)
      .catch(console.error)
      .finally(() => setLoading(false));

    OrganizationService.getMyOrganizationsKYC(orgId).then((data) => {
      if (data) {
        setKYC(data[0]);
      }
    });
  }, [orgId]);

  const handleKeyUpdate = (env: "TEST" | "LIVE", newKey: ApiKey) => {
    setKeys((prev) => [...prev.filter((k) => k.environment !== env), newKey]);
  };

  const testKey = keys.find((k) => k.environment === "TEST" && k.active);
  const liveKey = keys.find((k) => k.environment === "LIVE" && k.active);

  const currentStatus = kyc?.data.status;
  let config;

  if (currentStatus) {
    config = STATUS_CONFIG[currentStatus];
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="border border-gray-200 rounded-2xl p-5 animate-pulse bg-gray-50 h-28"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <h3 className="text-base font-semibold text-gray-900">API Keys</h3>

      {config && (
        <>
          KYC{" "}
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.classes}`}
          >
            {config.label}
          </span>
          <div>
            {kyc?.data.status === OrganizationKYCStatus.NOT_SUBMITTED && (
              <Link
                href={
                  orgId
                    ? `/dashboard/settings/submit-kyc?organizationId=${orgId}`
                    : "#"
                }
                onClick={(e) => !orgId && e.preventDefault()} // Prevents navigation if no ID
                aria-disabled={!orgId}
                className={`text-xs px-3 py-1.5 rounded-lg transition-colors font-medium
                  ${
                    !orgId
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
                      : "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
                  }`}
              >
                Submit KYC
              </Link>
            )}
          </div>
        </>
      )}
      <p className="text-sm text-gray-500">
        Use these keys to authenticate API requests. Test keys are for
        development; live keys process real transactions.
      </p>

      {environment === "TEST" && (
        <KeyRow
          label="Test API Key"
          environment="TEST"
          apiKey={testKey}
          orgId={orgId}
          onKeyUpdate={handleKeyUpdate}
          kycStatus={kyc?.data.status}
        />
      )}

      {environment === "PRODUCTION" && (
        <KeyRow
          label="Live API Key"
          environment="LIVE"
          apiKey={liveKey}
          orgId={orgId}
          onKeyUpdate={handleKeyUpdate}
          kycStatus={kyc?.data.status}
        />
      )}
    </div>
  );
};
