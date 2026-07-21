# Escuta DF - Ouvidoria Digital Inteligente

Projeto criado para o **1º Hackathon Participa DF** (Controladoria-Geral do Distrito Federal), com o objetivo de tornar a participação cidadã no governo tão simples quanto enviar um áudio no WhatsApp. O Escuta DF elimina barreiras de escrita e acessibilidade, permitindo que qualquer pessoa registre denúncias, sugestões ou elogios de forma rápida, inclusiva e segura.

## 🎥 Vídeo de Demonstração
Conforme exigido pelo edital, a demonstração do fluxo completo (acessibilidade, multicanalidade e anonimato) está disponível no link abaixo:

👉 **[Assista ao Vídeo de Demonstração aqui](https://drive.google.com/drive/folders/1D0o4BoQnOlNvyMxqE4lyuctYZb3Vk7E5?usp=sharing)** *Duração: < 7 minutos.*

---

## 🚀 Principais Funcionalidades
* **Acessibilidade Total (WCAG 2.1 AA):** Interface com alto contraste, navegação por teclado e integração com widget VLibras.
* **Multicanal de Entrada:** Suporte para Texto, Áudio (com transcrição automática), Vídeo em Libras e Imagens.
* **Anonimato e Segurança:** Opção de manifestação anônima para proteção do cidadão.
* **Geolocalização Inteligente:** Captura de localização para gestão pública eficiente.
* **Tecnologia PWA:** Instalação direta no smartphone sem necessidade de lojas de aplicativos.

---

## 🛠️ Tecnologias e IA (Edital Item 13.9)
Este projeto foi desenvolvido utilizando metodologias modernas de engenharia de software:

* **Ambiente de Desenvolvimento:** **Visual Studio Code (VS Code)**, utilizado como IDE principal para estruturação, depuração e refinamento manual de todo o sistema.
* **Versionamento:** Git e GitHub.
* **Frontend:** React, Vite, TailwindCSS, Shadcn UI.
* **Backend & Banco de Dados:** Node.js e **Supabase (The Postgres Development Platform)**.
* **ORM:** Drizzle.
* **Inteligência Artificial (IZA AI):** Integração para transcrição e processamento de linguagem natural (NLP).
* **Assistência de Codificação:** Uso das ferramentas **GitHub Copilot** e **Replit AI** para auxílio no desenvolvimento da lógica inicial. O código foi posteriormente **destrinchado, revisado e adaptado manualmente no VS Code** para cumprir os requisitos de acessibilidade do edital.

---

## 💻 Como Rodar Localmente
1. Clone este repositório.
2. Instale as dependências: `npm install`
3. Configure o arquivo `.env` com suas credenciais do **Supabase**.
4. Inicie o servidor de desenvolvimento: `npm run dev`
5. Acesse `http://localhost:5000` no seu navegador.

---

## 📢 Contato e Autoria
* **Desenvolvedora:** Jasmine de Sá Araújo
* **Instituição:** Engenharia de Software - UnDF
* **Time:** Projeto desenvolvido em colaboração para o 1º Hackathon Participa DF.