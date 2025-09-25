import type { ILogger } from "@/core/application/interfaces/ilog.app.inter";
import type { INlqQaRepository } from "@/core/application/interfaces/nlq/nlq-qa.app.inter";
import type { INlqQaKnowledgePort } from "@/core/application/ports/nlq-qa-knowledge.app.inter";
import type { INlqQaInformationPort } from "@/core/application/ports/nlq-qa-information.port";
import type { INlqQaQueryGenerationPort } from "@/core/application/ports/nlq-qa-query-generation.port";
import type { INlqQaErrorRepository } from "@/core/application/interfaces/nlq/nlq-qa-error.app.inter";
import { INlqQaTopologyGenerationPort } from "@/core/application/ports/nlq-qa-topology-generation.port";
import { INlqQaFeedbackRepository } from "@/core/application/interfaces/nlq/nlq-qa-feedback.app.inter";
import { INlqQaGoodRepository } from "@/core/application/interfaces/nlq/nlq-qa-good.app.inter";
import { IRoleRepository } from "@/core/application/interfaces/auth/role.app.inter";

// ==== UTILS ====
export const loggerMock = (): jest.Mocked<ILogger> =>
  ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  }) as jest.Mocked<ILogger>;

// ==== REPOSITORIES ====
export const nlqQaRepoMock = (): jest.Mocked<INlqQaRepository> =>
  ({
    create: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findAll: jest.fn(),
    softDeleteById: jest.fn(),
  }) as jest.Mocked<INlqQaRepository>;

export const errRepoMock = (): jest.Mocked<INlqQaErrorRepository> =>
  ({
    create: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findAll: jest.fn(),
    findByUserId: jest.fn(),
  }) as jest.Mocked<INlqQaErrorRepository>;

export const feedbackRepoMock = (): jest.Mocked<INlqQaFeedbackRepository> =>
  ({
    create: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findAll: jest.fn(),
    findByIsItGood: jest.fn(),
  }) as jest.Mocked<INlqQaFeedbackRepository>;

export const nlqQaGoodRepoMock = (): jest.Mocked<INlqQaGoodRepository> =>
  ({
    create: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findAll: jest.fn(),
    findByUserId: jest.fn(),
    switchSoftDelete: jest.fn(),
  }) as jest.Mocked<INlqQaGoodRepository>;

export const roleRepoMock = (): jest.Mocked<IRoleRepository> =>
  ({
    create: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findAll: jest.fn(),
    findByName: jest.fn(),
  }) as jest.Mocked<IRoleRepository>;

export const userRepoMock = (): jest.Mocked<any> =>
  ({
    create: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findAll: jest.fn(),
    findByEmail: jest.fn(),
  }) as jest.Mocked<any>;

// ==== PORTS ====
export const knowledgePortMock = (): jest.Mocked<INlqQaKnowledgePort> =>
  ({
    create: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findAll: jest.fn(),
    findByQuestion: jest.fn(),
  }) as jest.Mocked<INlqQaKnowledgePort>;

export const infoPortMock = (): jest.Mocked<INlqQaInformationPort> =>
  ({
    extractSchemaBased: jest.fn(),
    executeQuery: jest.fn(),
  }) as jest.Mocked<INlqQaInformationPort>;

export const genQueryPortMock = (): jest.Mocked<INlqQaQueryGenerationPort> =>
  ({
    createPromptTemplateToGenerateQuery: jest.fn(),
    queryGeneration: jest.fn(),
    extractQueryFromGenerationResponse: jest.fn(),
    safeQuery: jest.fn(),
    extractSuggestionsFromGenerationResponse: jest.fn(),
  }) as jest.Mocked<INlqQaQueryGenerationPort>;

export const genTopologyPortMock =
  (): jest.Mocked<INlqQaTopologyGenerationPort> =>
    ({
      genDetailQuestion: jest.fn(),
      genTablesColumns: jest.fn(),
      genSemanticFields: jest.fn(),
      genSemanticTables: jest.fn(),
      genFlags: jest.fn(),
      genThinkProcess: jest.fn(),
    }) as jest.Mocked<INlqQaTopologyGenerationPort>;
