/**
 * Real-Time Collaboration System
 * Enables multiple users to collaborate on tasks and workflows in real-time
 */

export interface CollaborationSession {
  id: string;
  taskId: number;
  participants: string[];
  startedAt: Date;
  endedAt?: Date;
  status: 'active' | 'ended';
}

export interface CollaborationMessage {
  sessionId: string;
  userId: string;
  message: string;
  timestamp: Date;
  type: 'text' | 'update' | 'notification';
}

export class CollaborationManager {
  private sessions: Map<string, CollaborationSession> = new Map();
  private messageHandlers: Map<string, Set<(msg: CollaborationMessage) => void>> = new Map();

  /**
   * Create a new collaboration session
   */
  createSession(taskId: number, userId: string): string {
    const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const session: CollaborationSession = {
      id: sessionId,
      taskId,
      participants: [userId],
      startedAt: new Date(),
      status: 'active',
    };

    this.sessions.set(sessionId, session);
    this.messageHandlers.set(sessionId, new Set());

    console.log(`Created collaboration session: ${sessionId}`);
    return sessionId;
  }

  /**
   * Join an existing collaboration session
   */
  joinSession(sessionId: string, userId: string): boolean {
    const session = this.sessions.get(sessionId);
    
    if (!session || session.status !== 'active') {
      return false;
    }

    if (!session.participants.includes(userId)) {
      session.participants.push(userId);
      this.broadcastMessage(sessionId, {
        sessionId,
        userId: 'system',
        message: `${userId} joined the session`,
        timestamp: new Date(),
        type: 'notification',
      });
    }

    return true;
  }

  /**
   * Leave a collaboration session
   */
  leaveSession(sessionId: string, userId: string): void {
    const session = this.sessions.get(sessionId);
    
    if (!session) return;

    session.participants = session.participants.filter(p => p !== userId);
    
    this.broadcastMessage(sessionId, {
      sessionId,
      userId: 'system',
      message: `${userId} left the session`,
      timestamp: new Date(),
      type: 'notification',
    });

    // End session if no participants left
    if (session.participants.length === 0) {
      this.endSession(sessionId);
    }
  }

  /**
   * Send a message to all participants
   */
  broadcastMessage(sessionId: string, message: CollaborationMessage): void {
    const handlers = this.messageHandlers.get(sessionId);
    
    if (!handlers) return;

    handlers.forEach(handler => {
      try {
        handler(message);
      } catch (error) {
        console.error('Error in message handler:', error);
      }
    });
  }

  /**
   * Subscribe to session messages
   */
  subscribeToMessages(sessionId: string, handler: (msg: CollaborationMessage) => void): () => void {
    let handlers = this.messageHandlers.get(sessionId);
    
    if (!handlers) {
      handlers = new Set();
      this.messageHandlers.set(sessionId, handlers);
    }

    handlers.add(handler);

    // Return unsubscribe function
    return () => {
      handlers.delete(handler);
    };
  }

  /**
   * End a collaboration session
   */
  endSession(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    
    if (!session) return;

    session.status = 'ended';
    session.endedAt = new Date();

    // Notify all participants
    this.broadcastMessage(sessionId, {
      sessionId,
      userId: 'system',
      message: 'Session ended',
      timestamp: new Date(),
      type: 'notification',
    });

    // Clean up handlers
    this.messageHandlers.delete(sessionId);
  }

  /**
   * Get active sessions
   */
  getActiveSessions(): CollaborationSession[] {
    return Array.from(this.sessions.values()).filter(s => s.status === 'active');
  }

  /**
   * Get session details
   */
  getSession(sessionId: string): CollaborationSession | undefined {
    return this.sessions.get(sessionId);
  }
}

// Singleton instance
let collaborationManager: CollaborationManager | null = null;

export function getCollaborationManager(): CollaborationManager {
  if (!collaborationManager) {
    collaborationManager = new CollaborationManager();
  }
  return collaborationManager;
}
