import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";

// Função principal que registra todas as rotas da API no servidor Express
export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Configuração da autenticação (Login, Sessão, etc)
  await setupAuth(app);
  registerAuthRoutes(app);

  // Endpoint: Criar Manifestação (Protegido - requer login)
  // Recebe os dados do formulário, valida e salva no banco
  app.post(api.reports.create.path, isAuthenticated, async (req, res) => {
    try {
      // Valida o corpo da requisição usando o schema (Zod) definido em shared
      const input = api.reports.create.input.parse(req.body);
      // Chama a camada de armazenamento para salvar os dados
      const report = await storage.createReport(input);
      // Retorna 201 (Created) em caso de sucesso
      res.status(201).json(report);
    } catch (err) {
      // Tratamento de erros de validação
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  // Endpoint: Consultar Status
  // Busca uma manifestação pelo número de protocolo
  app.get(api.reports.status.path, async (req, res) => {
    const protocol = req.params.protocol;
    // Busca no banco de dados
    const report = await storage.getReportByProtocol(protocol);
    // Se não achar, retorna 404 (Not Found)
    if (!report) {
      return res.status(404).json({ message: 'Protocolo não encontrado' });
    }
    // Retorna os dados da manifestação encontrada
    res.json(report);
  });

  return httpServer;
}
