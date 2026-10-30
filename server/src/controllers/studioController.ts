import { Response } from 'express';
import { store } from '../db/store.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';

export const getStudioDashboard = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, error: 'Não autenticado.' });
    return;
  }

  // Find participant profile
  let participant = store.participants.find((p) => p.userId === req.user!.id);
  if (!participant && (req.user.role === 'admin' || req.user.role === 'participant')) {
    participant = store.participants[0]; // fallback to Juliana Moreira for demo
  }

  if (!participant) {
    res.status(404).json({ success: false, error: 'Perfil de participante não associado.' });
    return;
  }

  // Posts
  const myPosts = store.diaryPosts.filter((p) => p.participantId === participant!.id);

  // Followers
  const myFollowers = store.follows.filter((f) => f.participantId === participant!.id);

  // Conversation Requests
  const pendingRequests = store.conversationRequests.filter(
    (c) => c.participantId === participant!.id && c.status === 'pending'
  );
  const activeChats = store.conversationRequests.filter(
    (c) => c.participantId === participant!.id && c.status === 'accepted'
  );

  // Financials
  const mySales = store.contentPurchases.filter((cp) => {
    const item = store.paidContents.find((c) => c.id === cp.paidContentId);
    return item && item.participantId === participant!.id;
  });

  const myLedger = store.financialLedger.filter((l) => l.participantId === participant!.id);
  const balanceMinorUnits = myLedger.length > 0 ? myLedger[myLedger.length - 1].balanceAfterMinorUnits : 0;

  // Paid items
  const myPaidContents = store.paidContents.filter((pc) => pc.participantId === participant!.id);

  res.json({
    success: true,
    data: {
      participant,
      stats: {
        totalPosts: myPosts.length,
        followersCount: myFollowers.length,
        pendingChatRequests: pendingRequests.length,
        activeChats: activeChats.length,
        totalSalesCount: mySales.length,
        balanceMinorUnits,
        balanceFormatted: `R$ ${(balanceMinorUnits / 100).toFixed(2)}`,
      },
      posts: myPosts,
      chatRequests: pendingRequests,
      paidContents: myPaidContents,
      ledger: myLedger.slice(-10).reverse(),
    },
  });
};

export const requestPayout = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, error: 'Não autenticado.' });
    return;
  }

  const { amountMinorUnits, pixKey } = req.body;
  if (!amountMinorUnits || amountMinorUnits <= 0) {
    res.status(400).json({ success: false, error: 'Valor de saque inválido.' });
    return;
  }

  let participant = store.participants.find((p) => p.userId === req.user!.id);
  if (!participant) participant = store.participants[0];

  const myLedger = store.financialLedger.filter((l) => l.participantId === participant.id);
  const currentBalance = myLedger.length > 0 ? myLedger[myLedger.length - 1].balanceAfterMinorUnits : 0;

  if (amountMinorUnits > currentBalance) {
    res.status(400).json({ success: false, error: 'Saldo insuficiente para realizar este saque.' });
    return;
  }

  const newBalance = currentBalance - amountMinorUnits;
  const ledgerEntry = {
    id: `payout-ledg-${Date.now()}`,
    participantId: participant.id,
    transactionType: 'payout' as const,
    amountMinorUnits: -amountMinorUnits,
    balanceAfterMinorUnits: newBalance,
    currency: 'BRL',
    description: `Solicitação de saque PIX para a chave: ${pixKey}`,
    createdAt: new Date().toISOString(),
  };

  store.financialLedger.push(ledgerEntry);
  store.save();

  res.json({
    success: true,
    message: 'Solicitação de saque enviada com sucesso.',
    data: ledgerEntry,
  });
};

