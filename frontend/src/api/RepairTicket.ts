import { mockData } from "../mocks/seedData";
import { mockTicketServer, MockApiError } from "../mocks/mockServer";
import { request, ApiError } from "./http";
import type { CallRegisterPayload, CallRegisterResult, CrewCandidate, RepairTicketView, RestorePayload } from "../types/dispatch";

const endpoint = "/repair-ticket";

const toApiError = (err: unknown): ApiError => {
  if (err instanceof MockApiError) {
    return new ApiError(err.status, err.code, err.message, err.conflict_ticket_id, err.conflict_reason);
  }
  throw err;
};

export async function listRepairTicket(): Promise<RepairTicketView[]> {
  try {
    return await request<RepairTicketView[]>(endpoint);
  } catch {
    return mockTicketServer.listTickets();
  }
}

export async function listCandidates(ticketId: number): Promise<CrewCandidate[]> {
  try {
    return await request<CrewCandidate[]>(`${endpoint}/${ticketId}/candidates`);
  } catch {
    return mockTicketServer.listCandidates(ticketId);
  }
}

export async function registerCall(payload: CallRegisterPayload): Promise<CallRegisterResult> {
  try {
    return await request<CallRegisterResult>(`${endpoint}/calls`, { method: "POST", body: JSON.stringify(payload) });
  } catch (err) {
    if (err instanceof TypeError) return mockTicketServer.registerCall(payload);
    throw err;
  }
}

export async function dispatchTicket(ticketId: number, teamId: number): Promise<RepairTicketView> {
  try {
    return await request<RepairTicketView>(`${endpoint}/${ticketId}/dispatch`, {
      method: "POST",
      body: JSON.stringify({ team_id: teamId })
    });
  } catch (err) {
    if (err instanceof TypeError) {
      try {
        return mockTicketServer.dispatch(ticketId, teamId);
      } catch (mockErr) {
        throw toApiError(mockErr);
      }
    }
    throw err;
  }
}

export async function arriveTicket(ticketId: number): Promise<RepairTicketView> {
  try {
    return await request<RepairTicketView>(`${endpoint}/${ticketId}/arrive`, { method: "POST", body: "{}" });
  } catch (err) {
    if (err instanceof TypeError) return mockTicketServer.arrive(ticketId);
    throw err;
  }
}

export async function restoreTicket(ticketId: number, payload: RestorePayload): Promise<RepairTicketView> {
  try {
    return await request<RepairTicketView>(`${endpoint}/${ticketId}/restore`, {
      method: "POST",
      body: JSON.stringify(payload)
    });
  } catch (err) {
    if (err instanceof TypeError) return mockTicketServer.restore(ticketId, payload);
    throw err;
  }
}

export async function closeTicket(ticketId: number): Promise<RepairTicketView> {
  try {
    return await request<RepairTicketView>(`${endpoint}/${ticketId}/close`, { method: "POST", body: "{}" });
  } catch (err) {
    if (err instanceof TypeError) return mockTicketServer.close(ticketId);
    throw err;
  }
}

export { mockData };
