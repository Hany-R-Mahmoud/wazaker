import type {
  AnalyzeRecitationRequest,
  AnalyzeRecitationResponse,
} from '../types';

export type AnalysisService = {
  analyzeRecitationAttempt(
    request: AnalyzeRecitationRequest,
  ): Promise<AnalyzeRecitationResponse>;
};

export type AnalysisServiceHandler =
  | ((request: AnalyzeRecitationRequest) => Promise<AnalyzeRecitationResponse>)
  | ((request: AnalyzeRecitationRequest) => AnalyzeRecitationResponse);

export function createAnalysisService(handler: AnalysisServiceHandler): AnalysisService {
  return {
    async analyzeRecitationAttempt(request: AnalyzeRecitationRequest): Promise<AnalyzeRecitationResponse> {
      return await handler(request);
    },
  };
}
