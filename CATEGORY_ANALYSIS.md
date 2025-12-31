# RitualFin Category Structure Analysis

**Generated:** 2025-12-30
**Purpose:** Analyze 3-level category hierarchy implementation and keyword mapping

---

## Executive Summary

### Current Implementation Status

| Component | Status | Notes |
|-----------|--------|-------|
| **Database Schema** | ✅ Partially Implemented | Category1 is enum, Category2/3 are text fields |
| **Level 1 (Category1)** | ⚠️ Simplified | Uses basic enum (20 values) vs proposed detailed structure |
| **Level 2 (Category2)** | ✅ Flexible | Free text field, supports proposed structure |
| **Level 3 (Category3)** | ✅ Flexible | Free text field, supports proposed structure |
| **Keywords per L3** | ✅ Documented | Comprehensive keyword list in proposal doc |

### Key Finding

**The database schema supports 3-level categorization BUT Category1 enum values don't match the proposed taxonomy.** Category2 and Category3 are flexible text fields that can accommodate the full proposed structure.

---

## 1. Database Implementation (Current State)

### Schema Definition (`shared/schema.ts`)

```typescript
// Category 1 - PostgreSQL ENUM (restricted values)
export const category1Enum = pgEnum("category_1", [
  "Receitas", "Moradia", "Mercado", "Compras Online",
  "Transporte", "Saúde", "Lazer", "Viagem", "Roupas",
  "Tecnologia", "Alimentação", "Energia", "Internet",
  "Educação", "Presentes", "Streaming", "Academia",
  "Investimentos", "Outros", "Interno"
]);

// Rules table
rules = {
  category1: category1Enum,  // ENUM - limited to 20 predefined values
  category2: text,           // TEXT - free form
  category3: text            // TEXT - free form
}

// Transactions table
transactions = {
  category1: category1Enum,  // ENUM - limited to 20 predefined values
  category2: text,           // TEXT - free form
  category3: text            // TEXT - free form
}
```

### Current Category1 Enum Values (20 values)

1. Receitas
2. Moradia
3. Mercado
4. Compras Online
5. Transporte
6. Saúde
7. Lazer
8. Viagem
9. Roupas
10. Tecnologia
11. Alimentação
12. Energia
13. Internet
14. Educação
15. Presentes
16. Streaming
17. Academia
18. Investimentos
19. Outros
20. Interno

---

## 2. Proposed Category Structure (from Documentation)

### Hierarchical Model (Levels 1-3)

**Design Principles:**
- **Level 1** = "Que tipo de gasto é este?" (What type of expense?)
- **Level 2** = "Onde isso se encaixa?" (Where does it fit?)
- **Level 3** = "O que exatamente é?" (What exactly is it?)

### Complete Proposed Structure with Keywords

---

## 📊 LEVEL 1: **Moradia** (Housing)

### Level 2: Casa Olching

| **Level 3** | **Keywords** |
|-------------|--------------|
| **Casa Olching – Aluguel (Pago)** | Schroeder; Monatsmiete; Miete; DAUERAUFTRAG; Dauerauftrag; Mietzahlung; Vermieter; Mietvertrag; Kaltmiete; Warmmiete; Haus Olching; Olching |
| **Casa Olching – Energia (Strom)** | LichtBlick; LICHTBLICK SE; Abschlag; Strom; Energie; Kunden-Nr.; Kundennr; November; FOLGELASTSCHRIFT; Lastschrift; Einzug; Haus Olching; Olching |
| **Casa Olching – Internet/TV/Telefone** | Vodafone; Vodafone Deutschland; meinkabel; Kabel; Internet; K-NR.; Kd-Nr; Rechnung online; FOLGELASTSCHRIFT; Lastschrift; Haus Olching; Olching; DSL |
| **Casa Olching – Nebenkosten/Condomínio** | Nebenkosten; NK; Hausgeld; WEG; Hausverwaltung; Betriebskosten; Abrechnung; Vorauszahlung; Nachzahlung; Jahresabrechnung; Wohneinheit; Umlage |
| **Casa Olching – Manutenção e Reparos** | Handwerker; Reparatur; Instandhaltung; Wartung; Notdienst; Rechnung; Service; Hausmeister; Sanitär; Elektro; Maler |
| **Casa Olching – Materiais e Compras** | Baumarkt; OBI; HORNBACH; Bauhaus; Toom; Material; Baustoff; Farbe; Schrauben; Werkzeug; Garten; Renovierung |
| **Casa Olching – Impostos e Taxas** | Grundsteuer; Gemeinde; Stadt; Steueramt; Abgaben; Bescheid; Haus Olching; Olching; Eigentum; Finanzamt; Müllgebühren |

### Level 2: Casa Karlsruhe

| **Level 3** | **Keywords** |
|-------------|--------------|
| **Casa Karlsruhe – Aluguel (Recebido)** | Dr. David Mueller; David Mueller; Miete; Miete incl; Nebenkosten; GUTSCHR. UEBERW; GUTSCHRIFT; DAUERAUFTR; Dauerauftrag; Knielingen; Karlsruhe; Mietzahlung |
| **Casa Karlsruhe – Financiamento** | Commerzbank; COMMERZBANK AG; LEISTUNGEN PER; Tilgung; Zinsen; AZ; IBAN DE22; IBAN DE92; FOLGELASTSCHRIFT; Lastschrift; Darlehen; Kredit; Haus Karlsruhe |
| **Casa Karlsruhe – Nebenkosten/WEG** | WEG loswohnen; WEG Loswohnen 2; Hausgeld; HG Vorauszahlung; Abrechnung; Jahresabrechnung; Nachzahlung; Wohneinheit; Eggensteiner Str; Karlsruhe |
| **Casa Karlsruhe – Aquecimento/Fernwärme** | KES; Karlsruher Energieservice; Energieservice; Fernwärme; Heizung; Wärme; V 2004774510; BEL; VK; Abschlag; Rechnung; Karlsruhe |
| **Casa Karlsruhe – Energia/Água** | Stadtwerke; Wasser; Abwasser; Strom; Gas; Energie; Abschlag; Zähler; Verbrauch; Karlsruhe; Einzug; Lastschrift; Rechnung |
| **Casa Karlsruhe – Internet/TV** | Vodafone; Telekom; 1&1; O2; Internet; Kabel; DSL; Router; Haus Karlsruhe; Karlsruhe; Lastschrift; Rechnung |
| **Casa Karlsruhe – Manutenção e Reparos** | Handwerker; Reparatur; Instandhaltung; Wartung; Hausmeister; Service; Rechnung; Baumarkt; Renovierung; Karlsruhe; Knielingen |
| **Casa Karlsruhe – Impostos e Taxas** | Grundsteuer; Finanzamt; Stadt Karlsruhe; Gemeinde; Steuer; Abgaben; Bescheid; Müllgebühren; Straßenreinigung; Haus Karlsruhe |

### Level 2: Casa Esting

| **Level 3** | **Keywords** |
|-------------|--------------|
| **Casa Esting – Financiamento** | R+V; R + V; R+V LEBENSVERSICHERUNG; DARLEHEN; Darlehen 20016850601; ZINSEN; Tilgung; V.Steigleder; DARLEHENSABSCHLUSS; FOLGELASTSCHRIFT |
| **Casa Esting – Materiais e Obras** | Baustelle; Bau; Bauunternehmen; Handwerker; Material; Baustoff; Rechnung; Esting; Neubau; Ausbau; Elektrik; Sanitär; Rohbau; Innenausbau |
| **Casa Esting – Serviços (Projetos/Arquitetura)** | Architekt; Statik; Vermesser; Bauamt; Genehmigung; Planung; Projekt; Gutachten; Gebühren; Esting; Rechnung; Honorar |
| **Casa Esting – Utilidades (Provisório)** | Baustrom; Baustellenstrom; Wasseranschluss; Bauwasser; Netzbetreiber; Anschluss; Zähler; Esting; Abschlag; Rechnung; Einzug |
| **Casa Esting – Manutenção e Reparos** | Reparatur; Wartung; Service; Handwerker; Esting; Rechnung; Mangel; Gewährleistung; Nachbesserung; Bauleistung |

---

## 📊 LEVEL 1: **Alimentação** (Food)

### Level 2: Supermercado e Mercearia

| **Level 3** | **Keywords** |
|-------------|--------------|
| **Supermercado – REWE/Lidl/Edeka/Netto/Aldi** | REWE; REWE 0887; REWE MARKT; REWE Markt GmbH; LIDL; Lidl sagt Danke; EDEKA; EDEKA OLCHING; Netto Marken-Discount; NETTO; ALDI; ALDI SUED; Norma; contactless; retail-store |
| **Supermercado – Outros/Mercados especiais** | Asia Markt; Asia Markt Olching; NATURKOSTINSEL; Naturkost; Fruchtwerk; FRUCHTWERK E.K.; Bio; Feinkost; Markt; Lebensmittel; grocery; retail-store |

### Level 2: Padaria e Café

| **Level 3** | **Keywords** |
|-------------|--------------|
| **Padaria/Café – Ihle/Wünsche** | Landbaeckerei Ihle; Bäckerei Ihle; Backstube Wuensche; Wuensche; Privat Baeckerei; BÄCKEREI; Konditorei; Peter s gute Backstube; bakery; Kaffee; contactless |
| **Padaria/Café – Outros** | Baeckerei Nussbaum; Wimme; Backstube; Café; Konditorei; Snack; Brötchen; Croissant; To-go; contactless; retail-store; QSR |

### Level 2: Restaurantes e Alimentação fora

| **Level 3** | **Keywords** |
|-------------|--------------|
| **Restaurante – Geral** | Restaurant; Ristorante; Pizzeria; Steakhouse; Gaucho Steakhouse; Bei Rosario; La Burrita; KatNi Asia Bistro; Five Guys; Pret A Manger; UZR*Ristorante; QSR |
| **Fast-food – McDonald's** | MCDONALDS; MCDONALDS1741; McDonalds Fil.; Burger; BK; Burger King; Pizza Hut; QSR; Drive; contactless; Processed; Authorised |

### Level 2: Bebidas e Especialidades

| **Level 3** | **Keywords** |
|-------------|--------------|
| **Bebidas – Vinhos/Loja especializada** | Weintreff; Weintreff Zom Hasatanz; Vinothek; Getränkemarkt; Wein; Spirits; Edeka Getränke; retail-store; contactless; Processed |

### Level 2: Refeição no trabalho

| **Level 3** | **Keywords** |
|-------------|--------------|
| **Almoço – Bosch** | Bosch; Mittag; Lunch; Almoco; almoço; FRUCHTWERK; Kantine; Mensa; Business Lunch; weekday; Processed; retail-store |

---

## 📊 LEVEL 1: **Compras & Estilo de Vida** (Shopping & Lifestyle)

### Level 2: Compras online & marketplace

| **Level 3** | **Keywords** |
|-------------|--------------|
| **Marketplace – Amazon** | AMAZON; AMZN; AMZN MKTP; AMZN Mktp; AMZN.COM/BILL; AMAZON.DE; AMAZON PRIM*; AMZN MKTP DE*; e-commerce; Authorised; Processed; 800-279-6620 |
| **Marketplace – Temu** | TEMU; TEMU.COM; TEMU.COM DUBLIN; temu*; reembolso; refund; Rückerstattung; e-commerce; DUBLIN 2; Processed; Authorised |
| **Loja online – Zalando** | ZALANDO; WWW.ZALANDO.DE; ZALANDO.DE; Berlin; zalando*; fashion; e-commerce; Processed; Authorised |
| **Pagamentos online – PayPal (Compras)** | PAYPAL; PayPal; PP.; Ihr Einkauf bei; purchase; compra; e-commerce; -GUTSCHR; -GUTSCHRIFT; -REFUND; -Rückerstattung; 4029357733 |

### Level 2: Lojas para casa & utilidades

| **Level 3** | **Keywords** |
|-------------|--------------|
| **Casa – TEDi/lojas de utilidades** | TEDI; TEDI FIL.; FIL. 4534; FIL. 5385; OLCHING; BERGKIRCHEN; Deko; Haushaltswaren; discount; retail-store; contactless; Processed |

### Level 2: Vestuário & calçados

| **Level 3** | **Keywords** |
|-------------|--------------|
| **Roupas – Geral (H&M/About You/Hollister)** | HM.COM; H&M; ABOUT YOU; Hollister; C & A; C&A; NKD; Mode; clothing; apparel; e-commerce; deposit; refund; Processed; Authorised |
| **Esportes/roupa esportiva – Decathlon** | DECATHLON; Decathlon Deutschland; Sport; sportswear; contactless; Authorised; Processed; retail-store |

### Level 2: Higiene & drogaria

| **Level 3** | **Keywords** |
|-------------|--------------|
| **Drogaria – DM** | DM; DM-DROGERIE; DM-DROGERIE MARKT; Drogeriemarkt; d2gl; 1557; 1681; Bergkirchen; Memmingen; retail-store; contactless; Processed |
| **Drogaria – Rossmann** | ROSSMANN; Rossmann 4032; Rossmann Olching; Drogerie; Körperpflege; contactless; Processed; retail-store; Fil. |
| **Drogaria/Perfumaria – Müller** | MUELLER; MUeLLER; MUELLER 1500; Müller Olching; Parfümerie; Drogerie; contactless; Processed; retail-store |

### Level 2: Assinaturas digitais & software

| **Level 3** | **Keywords** |
|-------------|--------------|
| **Assinatura – Apple (iCloud/App Store)** | APPLE.COM/BILL; Apple iCloud; iCloud; App Store; apple.com; billing; assinatura; subscription; e-commerce; retail-store; Processed; Authorised |
| **Assinatura – Google One/Google** | GOOGLEGOOGLE ONE; Google One; GOOGLE ONE; assinatura; subscription; e-commerce; Processed; Authorised; Google; Drive; storage |
| **Assinatura – Netflix** | NETFLIX; NETFLIX.COM; Netflix.com; assinatura; subscription; streaming; e-commerce; Processed; Authorised; NETFLIX.COM NETFLIX.COM |
| **Assinatura – Disney+** | DisneyPlus; Disney+; DISNEY PLUS; Ihr Einkauf bei DisneyPlus; PayPal; PP.; streaming; assinatura; subscription; FOLGELASTSCHRIFT; Lastschrift |
| **Assinatura – YouTube Premium** | YouTube Premiu; YouTube Premium; GOOGLE YouTube; GOOGLE; assinatura; subscription; e-commerce; Processed; Authorised |
| **Assinatura – OpenAI (ChatGPT)** | OPENAI *CHATGPT; CHATGPT SUBSCR; OpenAI; compra internacional; USD; e-commerce; Processed; Authorised; subscription; assinatura; foreign |
| **Assinatura – Claude.ai** | CLAUDE.AI; Claude AI; CLAUDE.AI SUBSCRIPTION; e-commerce; Processed; subscription; assinatura; AI |
| **Assinatura – ElevenLabs** | ELEVENLABS; ELEVENLABS.IO; elevenlabs.io; e-commerce; Processed; compra internacional; USD; subscription; assinatura |

### Level 2: Pets

| **Level 3** | **Keywords** |
|-------------|--------------|
| **Pets – Alimentação e acessórios** | Fressnapf; Tiernahrungs; Tiernahrung; Haustier; pet; Futter; Zubehör; retail-store; Processed |

### Level 2: Esportes & Fitness

| **Level 3** | **Keywords** |
|-------------|--------------|
| **Academia – Hommer Fitness (Olching)** | Hommer Fitness; cfOlching; RED LABEL; Schueler Studenten Azubis; OLC--; Offline; FOLGELASTSCHRIFT; Lastschrift; Fitness; Gym; Mitgliedschaft |
| **Artes marciais – BJJ/treinos** | BJJ Ausbildung; Julian Fazekas-Con; Fazekas; Dachau; JJ David; Event; Mitglied; FOLGELASTSCHRIFT; Lastschrift; Training; Dojo |

### Level 2: Presentes & Festas

| **Level 3** | **Keywords** |
|-------------|--------------|
| **Presentes – Geral** | Geschenk; Present; Gutschein; Wuensche; Wünsche; Geburtstag; Party; Feier; Ticket; Souvenir; retail-store; e-commerce |

---

## 📊 LEVEL 1: **Mobilidade** (Mobility)

### Level 2: Carro

| **Level 3** | **Keywords** |
|-------------|--------------|
| **Carro – Combustível/Posto** | Tankstelle; Q1; Q1 REWE TANKSTELLE; Esso; Shell; Aral; Total; OMV; Benzin; Diesel; Kraftstoff; fueling; contactless |
| **Carro – Seguro** | DEVK; DEVK Allgemeine; Kfz-Versicherung; Kfz Versicherung; Kennzeichen; FFB FA; Versicherung Nr; Beitrag; Einzug; Lastschrift; FOLGELASTSCHRIFT |
| **Carro – Estacionamento/Pedágio** | Handyparken; HANDYPARKEN; Parkhaus; Parkhausbet; Parkschein; Parkplatz; Parking; Maut; TFL; contactless; Processed |
| **Carro – Multas/Infrações** | Stadt Mannheim; Bußgeld; Ordnungswidrigkeit; Strafzettel; Verwarnung; Aktenzeichen; online-ueberweisung; Rechnung; Verkehrsordnungswidrigkeit |

### Level 2: Transporte público

| **Level 3** | **Keywords** |
|-------------|--------------|
| **Transporte – MVV/Ônibus/Trem** | MVV; PAYPAL *MVV; Ticket; Monatskarte; Bahn; DB; Abellio; TFL TRAVEL; Oyster; Bus; Tram; ÖPNV; e-commerce; retail-store |

---

## 📊 LEVEL 1: **Saúde & Seguros** (Health & Insurance)

### Level 2: Saúde

| **Level 3** | **Keywords** |
|-------------|--------------|
| **Médico/Clínica – PVS/consultas** | PVS bayern; PVS Bayern GmbH; Rechnung; Rechnungsnr; Arzt; Praxis; Behandlung; ONLINE-UEBERWEISUNG; Medico; consulta; Gebühr |
| **Dentista/Ortodontia** | Kinderzahnheilkunde; Gemeinschaftspraxis; Zahn; Zahnarzt; Rechnungsnummer; Rechnungsnr; ONLINE-UEBERWEISUNG; Dental; KFO |
| **Farmácia** | Apotheke; APOTHEKE; APOTHEKE CENTER; ROSEN-APOTHEKE; Rezept; Pharma; Medikament; Arznei; contactless; retail-store; Processed |
| **Ótica e óculos (Compra)** | Apollo Optik; APOLLO OPTIK; Optik; Brille; Kontaktlinsen; Sehtest; contactless; retail-store; Processed; Authorised |

### Level 2: Seguros

| **Level 3** | **Keywords** |
|-------------|--------------|
| **Seguro saúde – AOK** | AOK; AOK Baden-Wuerttemberg; EINZUG BEITRAG; Beitrag; Krankenversicherung; FOLGELASTSCHRIFT; Lastschrift; LS WIEDERGUTSCHRIFT |
| **Seguros – DEVK (Vida/Residencial/RC/Legal)** | DEVK; Lebensversicherungsverein; DEVK Riehlerstrasse; Hausrat; Haftpflicht; Rechtsschutz; Leben; Haushaltglas; Beitrag; FOLGELASTSCHRIFT |
| **Seguro vida/financiamento – R+V** | R+V; R + V; Lebensversicherung; Darlehen; Zinsen; Tilgung; Beitrag; FOLGELASTSCHRIFT; Lastschrift |

---

## 📊 LEVEL 1: **Educação & Crianças** (Education & Children)

### Level 2: Escola & taxas

| **Level 3** | **Keywords** |
|-------------|--------------|
| **Escola – Gymnasium Olching** | Freistaat Bayern Gymnasium Olching; Gymnasium Olching; EPZ-; Schullandheim; Oberammergau; iPad-Jamf; Lizenz; bitte anweisen; ONLINE-UEBERWEISUNG; TERM. |

### Level 2: Benefícios família

| **Level 3** | **Keywords** |
|-------------|--------------|
| **Benefício – Kindergeld** | Familienkasse; Bundesagentur fuer Arbeit; Kindergeld; KG; GUTSCHR. UEBERWEISUNG; Überweisung; Familienkasse; Zahlungseingang |

### Level 2: Atividades

| **Level 3** | **Keywords** |
|-------------|--------------|
| **Atividades – Cursos/clubes (Crianças)** | Kurs; Verein; Beitrag; Anmeldung; Training; Musikschule; Sportverein; Mitgliedschaft; Teilnahmegebühr; Rechnung; Lastschrift |

---

## 📊 LEVEL 1: **Lazer & Viagens** (Leisure & Travel)

### Level 2: Viagens

| **Level 3** | **Keywords** |
|-------------|--------------|
| **Viagens – Hotéis** | Hotel; Hilton; HILTON HOTELS; Novotel; NOVOTEL; Sheraton; SHERATON; booking; lodging; Aufenthalt; Processed; Authorised |
| **Viagens – Aluguel de carro** | Hertz; HERTZ CAR RENTAL; car rental; Mietwagen; airport; travel; reservation; Processed; Authorised |
| **Viagens – Transferências internacionais (Wise)** | Wise; TRANSFERWISE; WISE; transferência; transferencia; envio; remessa; e-commerce; Processed; -internal; -interno |

### Level 2: Entretenimento & eventos

| **Level 3** | **Keywords** |
|-------------|--------------|
| **Eventos – Ingressos/Tickets** | Muenchen Ticket; München Ticket; LOGMVV; TICKETSHOP; Ticket; Eintritt; Konzert; Event; e-commerce; Processed; Authorised |
| **Lazer – Compras/serviços não essenciais** | Freizeit; Spaß; Hobby; Spiel; Spielzeug; Entertainment; Bowling; Kino; Veranstaltung; retail-store; e-commerce |

---

## 📊 LEVEL 1: **Interna** (Internal Transfers)

### Level 2: Pagamento de cartões

| **Level 3** | **Keywords** |
|-------------|--------------|
| **Pagamento – Amex (Liquidação/Fatura)** | AMERICAN EXPRESS EUROPE; AMERICAN EXPRESS EUROPE S.A.; AXP; pagamento Amex; FOLGELASTSCHRIFT; EINMAL LASTSCHRIFT; ZAHLUNG ERHALTEN; ÜBERWEISUNG ERHALTEN |
| **Pagamento – Miles & More / DKB** | DEUTSCHE KREDITBANK; DKB; KREDITKARTENABRECHNUNG; Lufthansa Miles & More; ABRECHNUNG; pagamento M&M; Lastschrift; direct-debit; Sparkasse; DE98DKB |

---

## 📊 LEVEL 1: **Finanças & Transferências** (Finance & Transfers)

### Level 2: Transferências & Pix/PayPal

| **Level 3** | **Keywords** |
|-------------|--------------|
| **Transferência – PayPal (Top-up/withdraw)** | PayPal Europe; PAYPAL; INSTANT TRANSFER; ECHTZEIT-GUTSCHRIFT; ABBUCHUNG VOM PAYPAL-KONTO; PP.; GUTSCHR. UEBERWEISUNG; Luxembourg; LU947510 |

### Level 2: Saque em dinheiro

| **Level 3** | **Keywords** |
|-------------|--------------|
| **Saque – Caixa eletrônico (Sparkasse/ATM)** | BARGELDAUSZAHLUNG; GELDAUTOMAT; GA NR; SPARKASSE FUERSTENFELDBRUCK; OLCH-NORD; WESTSTADT; Debitk.; Karte; Abhebung; Bargeld; ATM |

### Level 2: Taxas & juros

| **Level 3** | **Keywords** |
|-------------|--------------|
| **Taxas bancárias – Sparkasse** | ENTGELTABSCHLUSS; Entgeltabrechnung; Entgelt; Gebühren; Kontoentgelt; Preis; Anlage; Sparkasse; Buchungsposten; -Zinsen |
| **Juros/câmbio – Taxa internacional (1,95%)** | 1,95% für Währungsumrechn; foreign-trx-fee; Auslandseinsatz; Währungsumrechnung; FX fee; compra internacional; USD; GBP; BRL; Processed; M&M |
| **Mensalidade cartão – Miles & More** | monatlicher Kartenpreis; product-fee; Kartenpreis; Monatsgebühr; Gebühr; Miles & More; M&M; Processed; -foreign-trx-fee |
| **Taxas – Devolução/Retorno de débito** | RETOURNIERTE LASTSCHRIFT; Rückgabe Lastschrift; RECHNUNG Rückgabe; Gebühren für retournierte Lastschrift; Rücklastschriftgebühren; Representation; Chargeback |

### Level 2: Dívidas & crédito

| **Level 3** | **Keywords** |
|-------------|--------------|
| **Crédito pessoal – ING DiBa** | ING-DiBa; Rahmenkredit; Tilgung; Zinsen; FOLGELASTSCHRIFT; Lastschrift; Kredit; Darlehen; 10/2025; DE65ING |
| **Financiamento varejista – Apollo Optik** | Apollo-Optik Holding; Apollo-Optik; DP25-; FOLGELASTSCHRIFT; Lastschrift; Rechnung; Amsterdam; NL48ZZZ; Raten; Finanzierung |
| **Empréstimo recebido – Targobank** | TARGOBANK; INTERNET TARGOBANK; VIELEN DANK; GUTSCHR. UEBERWEISUNG; Auszahlung; Kredit; Darlehen; Vertrag; 0000728540; VINICIUS STEIGLEDER |

---

## 📊 LEVEL 1: **Trabalho & Receitas** (Work & Income)

### Level 2: Salário

| **Level 3** | **Keywords** |
|-------------|--------------|
| **Salário – Vinicius (Bosch)** | Robert Bosch GmbH; LOHN GEHALT; Entgelt; Gehalt; Payroll; Gerlingen-Schillerhoehe; Entgelt 71336818; 10.2025; Überweisung; Gutschrift |
| **Salário – Erica (Transferência)** | Fernanda Mendonca Finato; Julia Behr; GUTSCHR. UEBERWEISUNG; Gehalt; salário; pagamento; transferência; credit; Überweisung |

### Level 2: Receita profissional

| **Level 3** | **Keywords** |
|-------------|--------------|
| **Receita profissional – Clientes** | Bianca De Freitas Lima; PAYPAL *biancaflima; PayPal; GUTSCHR. UEBERWEISUNG; Überweisung; invoice; serviço; atendimento; client; -refund |

### Level 2: Vendas online

| **Level 3** | **Keywords** |
|-------------|--------------|
| **Vendas online – Vinted/Mangopay** | Mangopay; Vinted; GUTSCHR. UEBERWEISUNG; Verkauf; venda; marketplace; AWV-MELDEPFLICHT; Rue du Fort Wallis; FR5221933; payout; Erlös |

### Level 2: Aluguel e rendas

| **Level 3** | **Keywords** |
|-------------|--------------|
| **Renda – Aluguel (Karlsruhe)** | Dr. David Mueller; Miete; Nebenkosten; Dauerauftrag; GUTSCHR. UEBERW. DAUERAUFTR; Karlsruhe; Knielingen; Mieteinnahme; Zahlungseingang |

---

## 📊 LEVEL 1: **Doações & Outros** (Donations & Others)

### Level 2: Doações/associações

| **Level 3** | **Keywords** |
|-------------|--------------|
| **Doação/Associação – Projeto social** | PAYPAL *BRUEDERLICH; BOG Mitglied; Mitglied; Beitrag; Spende; doação; donation; Verein; e-commerce; PayPal; -refund |

---

## 📊 LEVEL 1: **Revisão & Não Classificado** (Review & Unclassified)

### Level 2: Moradia – Geral (Revisão)

| **Level 3** | **Keywords** |
|-------------|--------------|
| **Moradia – Geral (Revisão) – Financiamento** | Darlehen; Finanzierung; Hypothek; Kredit; Tilgung; Zinsen; FOLGELASTSCHRIFT; Lastschrift; -Commerzbank; -R+V; -Haus Olching |
| **Moradia – Geral (Revisão) – Nebenkosten** | Nebenkosten; NK; Hausgeld; WEG; Hausverwaltung; Abrechnung; Vorauszahlung; Nachzahlung; Jahresabrechnung; Wohneinheit; Umlage; -loswohnen |
| **Moradia – Geral (Revisão) – Utilidades** | Strom; Gas; Wasser; Heizung; Fernwärme; Abschlag; Energie; Versorger; Rechnung; Lastschrift; Einzug; -Vodafone; -LichtBlick; -KES |
| **Moradia – Geral (Revisão) – Manutenção** | Handwerker; Reparatur; Instandhaltung; Wartung; Service; Rechnung; Material; Notdienst; Hausmeister; Sanitär; Elektro; -Baumarkt |
| **Moradia – Geral (Revisão) – Materiais/Obras** | Baustoff; Material; Bau; Baustelle; Renovierung; Ausbau; Handwerker; Rechnung; Lieferung; Montage; Projekt; -TEDI; -Amazon |
| **Moradia – Geral (Revisão) – Aluguel** | Miete; Monatsmiete; aluguel; rent; Dauerauftrag; DAUERAUFTRAG; Vermieter; Mieter; Nebenkosten; Kaltmiete; Warmmiete; -Schroeder; -David Mueller |

### Level 2: Transferências pessoais

| **Level 3** | **Keywords** |
|-------------|--------------|
| **Transferência – Família/Amigos** | ONLINE-UEBERWEISUNG; GUTSCHR. UEBERWEISUNG; Überweisung; Te amo; Diogo Rodrigues Steigleder; Marion Schanz; Rechnung; IBAN; Sparkasse -; -PayPal |

### Level 2: Despesa não identificada

| **Level 3** | **Keywords** |
|-------------|--------------|
| **Despesa – Comerciante não identificado** | retail-store; e-commerce; contactless; Authorised; Processed; Rechnung; Verwendungszweck; Händler; merchant; -BARGELDAUSZAHLUNG; -KREDITKARTENABRECHNUNG |

### Level 2: Receita não identificada

| **Level 3** | **Keywords** |
|-------------|--------------|
| **Receita – Entrada não identificada** | GUTSCHR. UEBERWEISUNG; Gutschrift; Zahlungseingang; credit; Überweisung; deposit; Erstattung; -Kindergeld; -LOHN GEHALT; -Miete |

---

## 3. Gap Analysis

### ❌ Issues Identified

1. **Category1 Enum Mismatch**
   - Database has simplified 20-value enum
   - Proposed structure has detailed hierarchical categories (Moradia, Alimentação, Compras & Estilo de Vida, etc.)
   - **Impact:** Cannot use proposed Level 1 categories without schema migration

2. **Migration Required**
   - Need to update `category1Enum` to match proposed structure
   - OR map current enum values to proposed structure in application layer

3. **Category Mapping Strategy**
   - Current: Simplified, flat structure
   - Proposed: Hierarchical, detailed, property-specific (Casa Olching, Casa Karlsruhe, Casa Esting)

### ✅ Working Components

1. **Category2 and Category3** are flexible TEXT fields - can accommodate full proposed structure
2. **Keywords system** is comprehensive and well-documented (1000+ keywords identified)
3. **Rules engine** supports all 3 levels in database

---

## 4. Recommendations

### Option 1: Update Database Enum (Breaking Change)

**Pros:** Clean, type-safe, matches proposal exactly
**Cons:** Requires migration, existing data needs remapping

```sql
-- Would need to:
1. Drop existing category1_enum
2. Create new enum with proposed values
3. Migrate existing transactions
4. Update all rules
```

### Option 2: Keep Simplified L1, Use L2/L3 for Detail (Recommended)

**Pros:** No breaking changes, flexible, backward compatible
**Cons:** Less type-safety at Level 1

**Mapping Strategy:**
- **Level 1 (Enum):** Keep as broad categories (Moradia, Alimentação, Compras Online, etc.)
- **Level 2 (Text):** Use for subcategories (Casa Olching, Supermercado e Mercearia, etc.)
- **Level 3 (Text):** Use for specific items with keywords

**Example Mapping:**
```
Current Enum "Moradia" → Maps to:
  L1: Moradia
  L2: Casa Olching | Casa Karlsruhe | Casa Esting
  L3: Aluguel (Pago) | Energia | Internet/TV | Nebenkosten | etc.
```

### Option 3: Application-Layer Mapping (Hybrid)

Use current enum as "broad category" and build mapping layer in code:

```typescript
const categoryMapping = {
  "Moradia": {
    subcategories: ["Casa Olching", "Casa Karlsruhe", "Casa Esting"],
    specific: ["Aluguel", "Energia", "Internet/TV", ...]
  },
  "Alimentação": {
    subcategories: ["Supermercado", "Padaria e Café", "Restaurantes"],
    specific: ["REWE/Lidl", "Ihle/Wünsche", "McDonald's", ...]
  }
  // ...
}
```

---

## 5. CSV Sample Analysis

From the Miles & More CSV sample provided:

### Transactions Identified:
- **LIDL** (3 occurrences) → Alimentação > Supermercado > REWE/Lidl
- **REWE** (3 occurrences) → Alimentação > Supermercado > REWE/Lidl
- **EDEKA** (2 occurrences) → Alimentação > Supermercado > REWE/Lidl
- **TEDI** (1 occurrence) → Compras & Estilo de Vida > Lojas para casa > TEDi
- **ROSEN-APOTHEKE** (1 occurrence) → Saúde & Seguros > Saúde > Farmácia
- **NETTO** (1 occurrence) → Alimentação > Supermercado > REWE/Lidl
- **AMAZON** (1 occurrence) → Compras & Estilo de Vida > Marketplace > Amazon

**Keyword Match Rate: 100%** - All merchants in sample CSV have matching keywords in proposal

---

## 6. Summary Table

| **Aspect** | **Database** | **Proposed Docs** | **Match?** |
|------------|--------------|-------------------|-----------|
| **3-Level Support** | ✅ Yes (1 enum + 2 text) | ✅ Yes | ✅ Compatible |
| **Level 1 Values** | 20 simplified values | 13 detailed categories | ❌ Mismatch |
| **Level 2 Flexibility** | ✅ Free text | ✅ Structured subcategories | ✅ Compatible |
| **Level 3 Flexibility** | ✅ Free text | ✅ Specific items | ✅ Compatible |
| **Keywords Documented** | Not in schema | ✅ 1000+ keywords | ⚠️ In docs only |
| **CSV Coverage** | N/A | ✅ All common merchants | ✅ Complete |

---

## Conclusion

**The 3-level category structure IS implemented in the database schema**, but there's a mismatch between:
- The **simplified Category1 enum** currently in the database
- The **detailed hierarchical proposal** in the documentation

**Recommended Path Forward:**
1. Keep current database schema (no breaking changes)
2. Use **Option 2** mapping strategy (broad L1 enum → detailed L2/L3 text)
3. Implement **application-layer validation** for L2/L3 based on documented keywords
4. Build **UI dropdowns** that reflect the proposed 3-level hierarchy
5. Create **migration plan** for future enum update if strict typing becomes critical

**Keywords are comprehensive and ready for implementation** - over 1000 keywords documented across all Level 3 categories, with 100% coverage of common German merchants (REWE, LIDL, EDEKA, ALDI, Amazon, DM, etc.) and user-specific entities (property names, salary sources, insurance providers).
