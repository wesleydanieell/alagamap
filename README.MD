# AlagaMap
<p align="center">
  <img src="https://img.shields.io/badge/Status-Production-green?style=for-the-badge" alt="Status">
  <img src="https://img.shields.io/badge/Platform-Web-blue?style=for-the-badge" alt="Platform">
  <img src="https://img.shields.io/badge/License-MIT-purple?style=for-the-badge" alt="License">
</p>

O **alagamap** é uma aplicação geográfica web estruturada para a análise, modelagem e visualização preditiva de suscetibilidade a alagamentos estruturais urbanos. O sistema realiza o cruzamento de matrizes de dados geoespaciais estáticos (altimetria, declividade e acúmulo de fluxo) com dados meteorológicos de precipitação dinâmica obtidos via API de alta precisão. 

O resultado é a geração em tempo real de manchas térmicas e raios de impacto georreferenciados sobre um mapa interativo, permitindo simulações de cenários de chuva de forma manual ou automatizada.

**Manual:**

![Demonstraçãodo Projeto](/src/assets/example-image-1.png)

**Automatizado:**

![Demonstraçãodo Projeto](/src/assets/example-image-2.png)

![Demonstraçãodo Projeto](/src/assets/example-image-3.png)

---

## Recursos Principais

* **Simulação Hidrológica Dinâmica:** Processamento matemático imediato baseado nos atributos hidrológicos locais a cada alteração do volume de chuva (mm).
* **Previsão em Tempo Real:** Integração pontual com barramento de dados meteorológicos para carregar automaticamente o cenário climático do dia atual e dos próximos 5 dias.
* **Cálculo de Vetores Client-Side:** Utilização de bibliotecas de geometria computacional direto no navegador, reduzindo a latência e dispensando processamento robusto em servidores back-end.
* **Interface Responsiva:** Painéis flutuantes integrados para controle fino de dados sem obstrução da área visual de mapeamento.

---

## Requisitos e Compatibilidade

A arquitetura do projeto adota o padrão *Vanilla HTML/JS*. Toda a biblioteca de interface geográfica e álgebra geoespacial é injetada via CDN de alta disponibilidade. 

| Dependência          | Versão Mínima | Função no Projeto                                 |
| :------------------- | :-----------: | :------------------------------------------------ |
| **Python**           |      3.x      | Servidor HTTP local (Bypass de segurança de CORS) |

---

## Instalação de Dependências

Para contornar as restrições de segurança de leitura de arquivos locais (*Cross-Origin Resource Sharing / CORS*) impostas pelos navegadores ao carregar arquivos GeoJSON pesados, é obrigatório rodar a aplicação sob um ambiente de servidor local HTTP. 

A única dependência necessária na sua máquina hospedeira é o interpretador Python 3 instalado.

### 🐧 Linux (Ubuntu / Debian / Fedora)

Execute os comandos abaixo no terminal para garantir que as ferramentas de controle de versão e o ambiente de runtime estejam configurados:

**Ubuntu / Debian**
```bash
# Atualizar repositórios do sistema
sudo apt update

# Instalar Git e Python 3
sudo apt install git python3 python3-pip -y
```

**Fedora**
```bash
# Instalar Git e Python 3
sudo dnf install git python3 pip 
```
### 🪟 Windows

1. Baixe o instalador do executável estável do **Python 3.x** no site oficial [python.org](https://www.python.org/).
    
2. **Importante:** Durante a instalação, marque a caixa de seleção **"Add python.exe to PATH"** antes de clicar em instalar.
    
3. Baixe e instale o cliente de terminal **Git para Windows** através do site oficial [git-scm.com](https://git-scm.com/).
    

## Execução do Projeto

Para garantir a resolução correta dos caminhos relativos do mapa, o servidor HTTP local deve obrigatoriamente ser inicializado a partir do **diretório raiz do projeto** (`alagamap/`), nunca de dentro da pasta `src/`.

### No Linux / macOS

Bash

```
# 1. Clone o repositório
git clone https://github.com/wesleydanieell/alagamap.git

# 2. Acesse a pasta raiz
cd alagamap

# 3. Inicialize o servidor local na porta 8000
python3 -m http.server 8000
```

### No Windows

Abra o Prompt de Comando (CMD) ou o PowerShell e execute a sequência:

PowerShell

```
# 1. Clone o repositório
git clone https://github.com/wesleydanieell/alagamap.git

# 2. Acesse a pasta raiz
cd alagamap

# 3. Inicialize o servidor local na porta 8000
python -m http.server 8000
```

Após iniciar o servidor em seu terminal, abra qualquer navegador de internet moderno e acesse a aplicação web pelo endereço:

```
http://localhost:8000/src/index.html
```

> 💡 **Nota Técnica:** Caso a porta 8000 já esteja alocada por outro serviço ativo no seu sistema operacional, você pode alterá-la adicionando o novo número ao final do comando de inicialização, por exemplo: `python -m http.server 8080`.

## Licença

Este projeto é distribuído sob os termos da licença **MIT**. Veja o arquivo `LICENSE` para mais detalhes e permissões de uso.