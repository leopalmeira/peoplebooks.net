import { Response } from 'express';
import { z } from 'zod';
import { store } from '../db/store.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { ConversationRequest, Message } from '../types/index.js';

export const requestChatSchema = z.object({
  body: z.object({
    participantId: z.string(),
    introMessage: z.string().min(5),
  }),
});

export const sendMessageSchema = z.object({
  body: z.object({
    content: z.string().min(1),
  }),
});

export const requestConversation = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, error: 'Não autenticado.' });
    return;
  }

  const { participantId, introMessage } = req.body;
  const participant = store.participants.find((p) => p.id === participantId);

  if (!participant) {
    res.status(404).json({ success: false, error: 'Participante não encontrado.' });
    return;
  }

  // Verify volume entitlement: Reader MUST have access to participant's volume!
  const hasEntitlement = store.volumeEntitlements.some(
    (e) => e.userId === req.user!.id && e.volumeId === participant.primaryVolumeId && e.status === 'active'
  ) || req.user.role === 'admin';

  if (!hasEntitlement) {
    res.status(403).json({
      success: false,
      error: `Para solicitar uma conversa com ${participant.name}, você precisa ter o Volume ${participant.primaryVolumeId} ativado na sua biblioteca.`,
      code: 'VOLUME_ENTITLEMENT_REQUIRED',
    });
    return;
  }

  const existing = store.conversationRequests.find(
    (c) => c.readerId === req.user!.id && c.participantId === participantId
  );

  if (existing) {
    res.json({
      success: true,
      message: 'Solicitação de conversa já enviada.',
      data: existing,
    });
    return;
  }

  const newRequest: ConversationRequest = {
    id: `conv-req-${Date.now()}`,
    readerId: req.user.id,
    participantId,
    introMessage,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  store.conversationRequests.push(newRequest);
  store.save();

  res.status(201).json({
    success: true,
    message: `Sua solicitação de conversa foi enviada para ${participant.name}. Você será notificado assim que for aceita.`,
    data: newRequest,
  });
};

export const respondToConversation = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, error: 'Não autenticado.' });
    return;
  }

  const { requestId } = req.params;
  const { status } = req.body; // 'accepted' | 'declined' | 'blocked'

  const convReq = store.conversationRequests.find((r) => r.id === requestId);
  if (!convReq) {
    res.status(404).json({ success: false, error: 'Solicitação não encontrada.' });
    return;
  }

  convReq.status = status;
  convReq.respondedAt = new Date().toISOString();
  store.save();

  res.json({
    success: true,
    data: convReq,
  });
};

export const getConversationMessages = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, error: 'Não autenticado.' });
    return;
  }

  const { participantId } = req.params;
  const participant = store.participants.find((p) => p.id === participantId);

  if (!participant) {
    res.status(404).json({ success: false, error: 'Participante não encontrado.' });
    return;
  }

  const conversationId = `conv-${req.user.id}-${participantId}`;
  const messages = store.messages.filter((m) => m.conversationId === conversationId);

  const request = store.conversationRequests.find(
    (r) => r.readerId === req.user!.id && r.participantId === participantId
  );

  res.json({
    success: true,
    data: {
      participant,
      status: request ? request.status : 'not_requested',
      introMessage: request?.introMessage,
      messages,
    },
  });
};

export const sendMessage = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, error: 'Não autenticado.' });
    return;
  }

  const { participantId } = req.params;
  const { content } = req.body;

  const conversationId = `conv-${req.user.id}-${participantId}`;

  const newMsg: Message = {
    id: `msg-${Date.now()}`,
    conversationId,
    senderId: req.user.id,
    content,
    createdAt: new Date().toISOString(),
  };

  store.messages.push(newMsg);
  store.save();

  res.status(201).json({
    success: true,
    data: newMsg,
  });
};

