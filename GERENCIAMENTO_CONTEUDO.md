# 📝 Sistema de Gerenciamento de Conteúdo - Horizonte do Saber

## 🎯 **Visão Geral**
Sistema intuitivo e moderno para administradores gerenciarem todo o conteúdo do site da escola de forma fácil e eficiente.

## 🔐 **Como Acessar**

1. **Faça login como administrador** em: `http://localhost:5177/login`
2. **Acesse o Dashboard** e clique em **"Gerenciar Site"** no menu lateral
3. **Ou acesse diretamente**: `http://localhost:5177/dashboard/content-manager`

## 🖥️ **Interface Principal**

### **Sidebar - Seções do Site**
O painel lateral contém todas as seções editáveis do site:

- 🏠 **Seção Principal** - Banner principal da página inicial
- 📖 **Nossa História** - Informações sobre a escola
- 📷 **Galeria de Fotos** - Carrossel de fotos da escola
- 👥 **Nossos Valores** - Serviços e valores da escola
- 💬 **Depoimentos** - Depoimentos de alunos e pais
- 📍 **Contato** - Informações de contato da escola

### **Área Principal de Edição**
- **Header colorido** com título e descrição da seção
- **Botão "Editar"** para ativar modo de edição
- **Formulário intuitivo** com todos os campos da seção
- **Botões "Salvar" e "Cancelar"** durante a edição

## ✏️ **Tipos de Campos Disponíveis**

### **1. Texto Simples**
- Para títulos e textos curtos
- Campo de entrada de linha única

### **2. Área de Texto**
- Para descrições e textos longos
- Campo de múltiplas linhas

### **3. Upload de Imagens**
- Arrastar e soltar ou clicar para selecionar
- Preview da imagem atual
- Botão "Alterar" ao passar o mouse
- Formatos aceitos: JPG, PNG, WebP
- Tamanhos recomendados mostrados

### **4. Lista de Itens (Array)**
- Para listas dinâmicas (valores, serviços, etc.)
- Botão "+" para adicionar novos itens
- Botão "🗑️" para remover itens
- Arrastar para reordenar (futuro)

### **5. Seletor de Cor**
- Para cores primárias e secundárias
- Seletor visual + campo de texto hexadecimal

## 🔄 **Como Editar Conteúdo**

### **Passo a Passo:**

1. **Selecione a seção** no menu lateral
2. **Clique em "Editar"** no header da seção
3. **Modifique os campos** desejados:
   - ✍️ Digite novos textos
   - 🖼️ Faça upload de novas imagens
   - ➕ Adicione/remova itens de listas
   - 🎨 Altere cores
4. **Clique em "Salvar"** para aplicar as mudanças
5. **Ou "Cancelar"** para descartar alterações

### **⚠️ Alertas Importantes:**
- 🟡 **"Alterações não salvas"** - Aparece quando há mudanças pendentes
- ❗ **Confirmação de cancelamento** - Se há alterações não salvas
- ✅ **Notificação de sucesso** - Quando conteúdo é salvo
- ❌ **Notificação de erro** - Se algo der errado

## 🖼️ **Gerenciamento de Imagens**

### **Upload de Imagens:**
- **Formatos aceitos:** JPG, PNG, WebP, SVG
- **Tamanho máximo:** 10MB por imagem
- **Resolução recomendada:**
  - Banner principal: 1920x1080px
  - Imagens de seção: 800x600px
  - Galeria: 1200x800px

### **Processo de Upload:**
1. **Clique na área de upload** ou arraste a imagem
2. **Aguarde o upload** (barra de progresso)
3. **Preview imediato** da nova imagem
4. **Clique "Salvar"** para confirmar

## 📱 **Recursos de Usabilidade**

### **Interface Intuitiva:**
- ✨ **Animações suaves** em todas as transições
- 🎨 **Cores codificadas** para cada seção
- 📝 **Tooltips informativos** com descrições
- 🔒 **Controle de acesso** (apenas administradores)

### **Feedback Visual:**
- 💡 **Ícones descritivos** para cada tipo de campo
- ⚡ **Indicadores de estado** (editando, salvando, salvo)
- 🎯 **Highlights** na seção ativa
- 📊 **Estados de loading** durante operações

### **Segurança:**
- 🔐 **Autenticação obrigatória**
- 👨‍💼 **Apenas administradores** podem acessar
- 🛡️ **Validação de campos** obrigatórios
- 💾 **Confirmação antes de perder alterações**

## 🚀 **Preview em Tempo Real**

### **Visualizar Mudanças:**
1. **Botão "Visualizar Site"** abre nova aba
2. **Atualize a página** do site após salvar
3. **Veja as mudanças** aplicadas imediatamente

## 📋 **Campos por Seção**

### **🏠 Seção Principal (Hero)**
- Título Principal
- Subtítulo
- Descrição
- Imagem de Fundo
- Texto do Botão

### **📖 Nossa História**
- Título da Seção
- Descrição Completa
- Anos de Experiência
- Alunos Formados
- Imagem da Seção

### **📷 Galeria de Fotos**
- Título da Galeria
- Descrição da Galeria
- Lista de Fotos (até 10)

### **👥 Nossos Valores**
- Título da Seção
- Descrição
- Lista de Valores/Serviços

### **💬 Depoimentos**
- Título da Seção
- Lista de Depoimentos

### **📍 Contato**
- Título da Seção
- Endereço Completo
- Telefone
- Email
- Horário de Funcionamento

## 🔧 **Solução de Problemas**

### **Problemas Comuns:**

**🚫 "Acesso Negado"**
- Verifique se está logado como administrador
- Faça logout e login novamente

**📷 "Erro no Upload de Imagem"**
- Verifique o tamanho do arquivo (máx 10MB)
- Use formatos suportados (JPG, PNG, WebP)
- Verifique sua conexão com a internet

**💾 "Erro ao Salvar"**
- Verifique sua conexão com a internet
- Recarregue a página e tente novamente
- Verifique se preencheu campos obrigatórios (*)

## 📞 **Suporte**

Em caso de dúvidas ou problemas:
- 📧 **Email:** suporte@horizontedosaber.com.br
- 📱 **WhatsApp:** (11) 99999-9999
- 🕐 **Horário:** Segunda a Sexta, 8h às 18h

---

## 🎯 **Dicas Importantes**

1. **✅ Sempre salve** suas alterações antes de trocar de seção
2. **🔄 Atualize o site** após salvar para ver as mudanças
3. **📱 Teste em dispositivos móveis** após grandes alterações
4. **💾 Faça backup** das imagens importantes antes de substituir
5. **🎨 Mantenha consistência** visual nas cores e textos

**Sistema desenvolvido para facilitar a gestão de conteúdo do site da escola! 🎓✨**