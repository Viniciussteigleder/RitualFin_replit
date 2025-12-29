# Proposta de Classificação de Categorias (Nível 1–3)

## 1) Princípios de Design

- A hierarquia evita confusão e reduz retrabalho quando categorias mudam.
- Regras devem apontar para o Nível 3 para manter estabilidade quando N1/N2 forem reorganizados.

## 2) Definições de Nível (claras)

- Nível 1 = “Que tipo de gasto é este?”
- Nível 2 = “Onde isso se encaixa?”
- Nível 3 = “O que exatamente é?”

## 3) Proposta Inicial (conjunto exemplo)

N1: Moradia
- N2: Habitação
  - N3: Aluguel
  - N3: Energia
  - N3: Internet

N1: Alimentação
- N2: Supermercado
  - N3: Supermercado
- N2: Comer fora
  - N3: Restaurante

N1: Mobilidade
- N2: Transporte
  - N3: Combustível
  - N3: Transporte público

N1: Saúde
- N2: Cuidados
  - N3: Farmácia
  - N3: Médico

N1: Lazer
- N2: Assinaturas
  - N3: Streaming
  - N3: Software

N1: Finanças
- N2: Taxas e juros
  - N3: Taxas bancárias

N1: Trabalho e receitas
- N2: Salário
  - N3: Salário

N1: Interna
- N2: Transferências internas
  - N3: Pagamento de cartão

## 4) Categoria Interna

- “Interna” representa movimentações entre contas próprias.
- Deve existir no histórico, mas ser excluída de análises, orçamento e métricas.

## 5) Por que isso funciona no longo prazo

- Permite reorganizar N1/N2 sem recategorizar o histórico.
- Regras estáveis no N3 evitam quebra de automações.
- Dashboards ficam limpos e comparáveis ao longo do tempo.

## 6) Tabela Detalhada (referência fornecida)

| **Nivel_1_PT** | **Nivel_2_PT** | **Nivel_3_PT** | **Nivel_1_DE** | **Nivel_2_DE** | **Nivel_3_DE** | **Palavras_chave_exemplos** |
| --- | --- | --- | --- | --- | --- | --- |
| Moradia | Casa Olching | Casa Olching – Aluguel (Pago) | Wohnen | Haus Olching | Haus Olching – Miete (Gezahlt) | Schroeder; Monatsmiete; Miete; DAUERAUFTRAG; Dauerauftrag; Mietzahlung; Vermieter; Mietvertrag; Kaltmiete; Warmmiete; Haus Olching; Olching |
| Moradia | Casa Olching | Casa Olching – Energia (Strom) | Wohnen | Haus Olching | Haus Olching – Strom | LichtBlick; LICHTBLICK SE; Abschlag; Strom; Energie; Kunden-Nr.; Kundennr; November; FOLGELASTSCHRIFT; Lastschrift; Einzug; Haus Olching; Olching |
| Moradia | Casa Olching | Casa Olching – Internet/TV/Telefone (Casa) | Wohnen | Haus Olching | Haus Olching – Internet/TV/Telefon (Haus) | Vodafone; Vodafone Deutschland; meinkabel; Kabel; Internet; K-NR.; Kd-Nr; Rechnung online; FOLGELASTSCHRIFT; Lastschrift; Haus Olching; Olching; DSL |
| Moradia | Casa Olching | Casa Olching – Nebenkosten/Condomínio | Wohnen | Haus Olching | Haus Olching – Nebenkosten/Hausgeld | Nebenkosten; NK; Hausgeld; WEG; Hausverwaltung; Betriebskosten; Abrechnung; Vorauszahlung; Nachzahlung; Jahresabrechnung; Wohneinheit; Umlage |
| Moradia | Casa Olching | Casa Olching – Manutenção e Reparos | Wohnen | Haus Olching | Haus Olching – Instandhaltung & Reparaturen | Handwerker; Reparatur; Instandhaltung; Wartung; Notdienst; Rechnung; Service; Hausmeister; Sanitär; Elektro; Maler |
| Moradia | Casa Olching | Casa Olching – Materiais e Compras para Casa | Wohnen | Haus Olching | Haus Olching – Materialien & Hausbedarf | Baumarkt; OBI; HORNBACH; Bauhaus; Toom; Material; Baustoff; Farbe; Schrauben; Werkzeug; Garten; Renovierung |
| Moradia | Casa Olching | Casa Olching – Impostos e Taxas (Imóvel) | Wohnen | Haus Olching | Haus Olching – Steuern & Abgaben (Immobilie) | Grundsteuer; Gemeinde; Stadt; Steueramt; Abgaben; Bescheid; Haus Olching; Olching; Eigentum; Finanzamt; Müllgebühren |
| Moradia | Casa Karlsruhe | Casa Karlsruhe – Aluguel (Recebido) | Wohnen | Haus Karlsruhe | Haus Karlsruhe – Miete (Erhalten) | Dr. David Mueller; David Mueller; Miete; Miete incl; Nebenkosten; GUTSCHR. UEBERW; GUTSCHRIFT; DAUERAUFTR; Dauerauftrag; Knielingen; Karlsruhe; Mietzahlung |
| Moradia | Casa Karlsruhe | Casa Karlsruhe – Financiamento | Wohnen | Haus Karlsruhe | Haus Karlsruhe – Finanzierung | Commerzbank; COMMERZBANK AG; LEISTUNGEN PER; Tilgung; Zinsen; AZ; IBAN DE22; IBAN DE92; FOLGELASTSCHRIFT; Lastschrift; Darlehen; Kredit; Haus Karlsruhe |
| Moradia | Casa Karlsruhe | Casa Karlsruhe – Nebenkosten/WEG/Hausverwaltung | Wohnen | Haus Karlsruhe | Haus Karlsruhe – Nebenkosten/WEG/Hausverwaltung | WEG loswohnen; WEG Loswohnen 2; Hausgeld; HG Vorauszahlung; Abrechnung; Jahresabrechnung; Nachzahlung; Wohneinheit; Eggensteiner Str; Karlsruhe; FOLGELASTSCHRIFT; ONLINE-UEBERWEISUNG |
| Moradia | Casa Karlsruhe | Casa Karlsruhe – Aquecimento/Fernwärme | Wohnen | Haus Karlsruhe | Haus Karlsruhe – Heizung/Fernwärme | KES; Karlsruher Energieservice; Energieservice; Fernwärme; Heizung; Wärme; V 2004774510; BEL; VK; Abschlag; GUTSCHR. UEBERWEISUNG; Rechnung; Karlsruhe |
| Moradia | Casa Karlsruhe | Casa Karlsruhe – Energia/Água (Utilidades) | Wohnen | Haus Karlsruhe | Haus Karlsruhe – Energie/Wasser (Nebenkosten) | Stadtwerke; Wasser; Abwasser; Strom; Gas; Energie; Abschlag; Zähler; Verbrauch; Karlsruhe; Einzug; Lastschrift; Rechnung |
| Moradia | Casa Karlsruhe | Casa Karlsruhe – Internet/TV (Imóvel) | Wohnen | Haus Karlsruhe | Haus Karlsruhe – Internet/TV (Immobilie) | Vodafone; Telekom; 1&1; O2; Internet; Kabel; DSL; Router; Haus Karlsruhe; Karlsruhe; Lastschrift; Rechnung |
| Moradia | Casa Karlsruhe | Casa Karlsruhe – Manutenção e Reparos | Wohnen | Haus Karlsruhe | Haus Karlsruhe – Instandhaltung & Reparaturen | Handwerker; Reparatur; Instandhaltung; Wartung; Hausmeister; Service; Rechnung; Baumarkt; Renovierung; Karlsruhe; Knielingen; Material |
| Moradia | Casa Karlsruhe | Casa Karlsruhe – Impostos e Taxas (Imóvel) | Wohnen | Haus Karlsruhe | Haus Karlsruhe – Steuern & Abgaben (Immobilie) | Grundsteuer; Finanzamt; Stadt Karlsruhe; Gemeinde; Steuer; Abgaben; Bescheid; Müllgebühren; Straßenreinigung; Haus Karlsruhe; Karlsruhe |
| Moradia | Casa Esting | Casa Esting – Financiamento | Wohnen | Haus Esting | Haus Esting – Finanzierung | R+V; R + V; R+V LEBENSVERSICHERUNG; DARLEHEN; Darlehen 20016850601; ZINSEN; Tilgung; V.Steigleder; DARLEHENSABSCHLUSS; IBAN DE207016946; FOLGELASTSCHRIFT |
| Moradia | Casa Esting | Casa Esting – Materiais e Obras (Construção) | Wohnen | Haus Esting | Haus Esting – Baumaterial & Bauarbeiten | Baustelle; Bau; Bauunternehmen; Handwerker; Material; Baustoff; Rechnung; Esting; Neubau; Ausbau; Elektrik; Sanitär; Rohbau; Innenausbau |
| Moradia | Casa Esting | Casa Esting – Serviços (Projetos/Arquitetura/Admin) | Wohnen | Haus Esting | Haus Esting – Dienstleistungen (Planung/Verwaltung) | Architekt; Statik; Vermesser; Bauamt; Genehmigung; Planung; Projekt; Gutachten; Gebühren; Esting; Rechnung; Honorar |
| Moradia | Casa Esting | Casa Esting – Utilidades (Provisório/Construção) | Wohnen | Haus Esting | Haus Esting – Versorger (Bau/Provisorium) | Baustrom; Baustellenstrom; Wasseranschluss; Bauwasser; Netzbetreiber; Anschluss; Zähler; Esting; Abschlag; Rechnung; Einzug |
| Moradia | Casa Esting | Casa Esting – Manutenção e Reparos | Wohnen | Haus Esting | Haus Esting – Instandhaltung & Reparaturen | Reparatur; Wartung; Service; Handwerker; Esting; Rechnung; Mangel; Gewährleistung; Nachbesserung; Bauleistung |
| Alimentação | Supermercado e Mercearia | Supermercado – REWE/Lidl/Edeka/Netto/Aldi | Essen | Supermarkt & Lebensmittel | Supermarkt – REWE/Lidl/Edeka/Netto/Aldi | REWE; REWE 0887; REWE MARKT; REWE Markt GmbH; LIDL; Lidl sagt Danke; EDEKA; EDEKA OLCHING; Netto Marken-Discount; NETTO; ALDI; ALDI SUED; Norma; contactless; retail-store |
| Alimentação | Supermercado e Mercearia | Supermercado – Outros/Mercados especiais | Essen | Supermarkt & Lebensmittel | Supermarkt – Sonstige/Spezialmärkte | Asia Markt; Asia Markt Olching; NATURKOSTINSEL; Naturkost; Fruchtwerk; FRUCHTWERK E.K.; Bio; Feinkost; Markt; Lebensmittel; grocery; retail-store; contactless |
| Alimentação | Padaria e Café | Padaria/Café – Ihle/Wünsche e similares | Essen | Bäckerei & Café | Bäckerei/Café – Ihle/Wünsche u.ä. | Landbaeckerei Ihle; Bäckerei Ihle; Backstube Wuensche; Wuensche; Privat Baeckerei; BÄCKEREI; Konditorei; Peter s gute Backstube; bakery; Kaffee; contactless; retail-store |
| Alimentação | Padaria e Café | Padaria/Café – Outros | Essen | Bäckerei & Café | Bäckerei/Café – Sonstige | Baeckerei Nussbaum; Wimme; Backstube; Café; Konditorei; Snack; Brötchen; Croissant; To-go; contactless; retail-store; QSR |
| Alimentação | Restaurantes e Alimentação fora | Restaurante – Geral | Essen | Restaurant & Auswärtsessen | Restaurant – Allgemein | Restaurant; Ristorante; Pizzeria; Steakhouse; Gaucho Steakhouse; Bei Rosario; La Burrita; KatNi Asia Bistro; Five Guys; Pret A Manger; UZR*Ristorante; QSR |
| Alimentação | Restaurantes e Alimentação fora | Fast-food – McDonald’s e similares | Essen | Restaurant & Auswärtsessen | Fast-Food – McDonald’s u.ä. | MCDONALDS; MCDONALDS1741; McDonalds Fil.; Burger; BK; Burger King; Pizza Hut; QSR; Drive; contactless; Processed; Authorised |
| Alimentação | Bebidas e Especialidades | Bebidas – Vinhos/Loja especializada | Essen | Getränke & Spezialitäten | Getränke – Wein/Fachhandel | Weintreff; Weintreff Zom Hasatanz; Vinothek; Getränkemarkt; Wein; Spirits; Edeka Getränke; retail-store; contactless; Processed |
| Alimentação | Refeição no trabalho | Almoço – Bosch | Essen | Essen bei der Arbeit | Mittagessen – Bosch | Bosch; Mittag; Lunch; Almoco; almoço; FRUCHTWERK; Kantine; Mensa; Business Lunch; weekday; Processed; retail-store |
| Compras & Estilo de Vida | Compras online & marketplace | Marketplace – Amazon | Konsum & Lifestyle | Online-Käufe & Marktplätze | Marktplatz – Amazon | AMAZON; AMZN; AMZN MKTP; AMZN Mktp; AMZN.COM/BILL; AMAZON.DE; AMAZON PRIM*; AMZN MKTP DE*; e-commerce; Authorised; Processed; 800-279-6620 |
| Compras & Estilo de Vida | Compras online & marketplace | Marketplace – Temu | Konsum & Lifestyle | Online-Käufe & Marktplätze | Marktplatz – Temu | TEMU; TEMU.COM; TEMU.COM DUBLIN; temu*; reembolso; refund; Rückerstattung; e-commerce; DUBLIN 2; Processed; Authorised |
| Compras & Estilo de Vida | Compras online & marketplace | Loja online – Zalando | Konsum & Lifestyle | Online-Käufe & Marktplätze | Online-Shop – Zalando | ZALANDO; [WWW.ZALANDO.DE](http://www.zalando.de/); ZALANDO.DE; Berlin; zalando*; fashion; e-commerce; Processed; Authorised |
| Compras & Estilo de Vida | Compras online & marketplace | Pagamentos online – PayPal (Compras) | Konsum & Lifestyle | Online-Käufe & Marktplätze | Online-Zahlung – PayPal (Einkäufe) | PAYPAL ; PayPal; PP.; Ihr Einkauf bei; purchase; compra; e-commerce; -GUTSCHR; -GUTSCHRIFT; -REFUND; -Rückerstattung; 4029357733 |
| Compras & Estilo de Vida | Lojas para casa & utilidades | Casa – TEDi/lojas de utilidades | Konsum & Lifestyle | Haushalt & Einrichtung | Haushalt – TEDi/Discounter | TEDI; TEDI FIL.; FIL. 4534; FIL. 5385; OLCHING; BERGKIRCHEN; Deko; Haushaltswaren; discount; retail-store; contactless; Processed |
| Compras & Estilo de Vida | Vestuário & calçados | Roupas – Geral (H&M/About You/Hollister etc.) | Konsum & Lifestyle | Kleidung & Schuhe | Kleidung – Allgemein (H&M/About You/Hollister etc.) | HM.COM; H&M; ABOUT YOU; Hollister; C & A; C&A; NKD; Mode; clothing; apparel; e-commerce; deposit; refund; Processed; Authorised |
| Compras & Estilo de Vida | Vestuário & calçados | Esportes/roupa esportiva – Decathlon | Konsum & Lifestyle | Kleidung & Schuhe | Sportartikel – Decathlon | DECATHLON; Decathlon Deutschland; Sport; sportswear; contactless; Authorised; Processed; retail-store |
| Compras & Estilo de Vida | Higiene & drogaria | Drogaria – DM | Konsum & Lifestyle | Drogerie & Körperpflege | Drogerie – DM | DM; DM-DROGERIE; DM-DROGERIE MARKT; Drogeriemarkt; d2gl; 1557; 1681; Bergkirchen; Memmingen; retail-store; contactless; Processed |
| Compras & Estilo de Vida | Higiene & drogaria | Drogaria – Rossmann | Konsum & Lifestyle | Drogerie & Körperpflege | Drogerie – Rossmann | ROSSMANN; Rossmann 4032; Rossmann Olching; Drogerie; Körperpflege; contactless; Processed; retail-store; Fil. |
| Compras & Estilo de Vida | Higiene & drogaria | Drogaria/Perfumaria – Müller | Konsum & Lifestyle | Drogerie & Körperpflege | Drogerie/Parfümerie – Müller | MUELLER; MUeLLER; MUELLER 1500; Müller Olching; Parfümerie; Drogerie; contactless; Processed; retail-store |
| Compras & Estilo de Vida | Assinaturas digitais & software | Assinatura – Apple (iCloud/App Store) | Konsum & Lifestyle | Digitale Abos & Software | Abo – Apple (iCloud/App Store) | APPLE.COM/BILL; Apple iCloud; iCloud; App Store; apple.com; billing; assinatura; subscription; e-commerce; retail-store; Processed; Authorised |
| Compras & Estilo de Vida | Assinaturas digitais & software | Assinatura – Google One/Google | Konsum & Lifestyle | Digitale Abos & Software | Abo – Google One/Google | GOOGLEGOOGLE ONE; Google One; GOOGLE ONE; assinatura; subscription; e-commerce; Processed; Authorised; Google; Drive; storage |
| Compras & Estilo de Vida | Assinaturas digitais & software | Assinatura – Netflix | Konsum & Lifestyle | Digitale Abos & Software | Abo – Netflix | NETFLIX; NETFLIX.COM; Netflix.com; assinatura; subscription; streaming; e-commerce; Processed; Authorised; NETFLIX.COM NETFLIX.COM |
| Compras & Estilo de Vida | Assinaturas digitais & software | Assinatura – Disney+ | Konsum & Lifestyle | Digitale Abos & Software | Abo – Disney+ | DisneyPlus; Disney+; DISNEY PLUS; Ihr Einkauf bei DisneyPlus; PayPal; PP.; streaming; assinatura; subscription; FOLGELASTSCHRIFT; Lastschrift |
| Compras & Estilo de Vida | Assinaturas digitais & software | Assinatura – YouTube Premium | Konsum & Lifestyle | Digitale Abos & Software | Abo – YouTube Premium | YouTube Premiu; YouTube Premium; GOOGLE YouTube; GOOGLE; assinatura; subscription; e-commerce; Processed; Authorised |
| Compras & Estilo de Vida | Assinaturas digitais & software | Assinatura – OpenAI (ChatGPT) | Konsum & Lifestyle | Digitale Abos & Software | Abo – OpenAI (ChatGPT) | OPENAI *CHATGPT; CHATGPT SUBSCR; OpenAI; compra internacional; USD; e-commerce; Processed; Authorised; subscription; assinatura; foreign |
| Compras & Estilo de Vida | Assinaturas digitais & software | Assinatura – Claude.ai | Konsum & Lifestyle | Digitale Abos & Software | Abo – Claude.ai | CLAUDE.AI; Claude AI; CLAUDE.AI SUBSCRIPTION; e-commerce; Processed; subscription; assinatura; AI |
| Compras & Estilo de Vida | Assinaturas digitais & software | Assinatura – ElevenLabs | Konsum & Lifestyle | Digitale Abos & Software | Abo – ElevenLabs | ELEVENLABS; ELEVENLABS.IO; elevenlabs.io; e-commerce; Processed; compra internacional; USD; subscription; assinatura |
| Compras & Estilo de Vida | Pets | Pets – Alimentação e acessórios | Konsum & Lifestyle | Haustiere | Haustiere – Futter & Zubehör | Fressnapf; Tiernahrungs; Tiernahrung; Haustier; pet; Futter; Zubehör; retail-store; Processed |
| Compras & Estilo de Vida | Esportes & Fitness | Academia – Hommer Fitness (Olching) | Konsum & Lifestyle | Sport & Fitness | Fitnessstudio – Hommer Fitness (Olching) | Hommer Fitness; cfOlching; RED LABEL; Schueler Studenten Azubis; OLC--; Offline; FOLGELASTSCHRIFT; Lastschrift; Fitness; Gym; Mitgliedschaft |
| Compras & Estilo de Vida | Esportes & Fitness | Artes marciais – BJJ/treinos | Konsum & Lifestyle | Sport & Fitness | Kampfsport – BJJ/Training | BJJ Ausbildung; Julian Fazekas-Con; Fazekas; Dachau; JJ David; Event; Mitglied; FOLGELASTSCHRIFT; Lastschrift; Training; Dojo |
| Compras & Estilo de Vida | Presentes & Festas | Presentes – Geral | Konsum & Lifestyle | Geschenke & Feiern | Geschenke – Allgemein | Geschenk; Present; Gutschein; Wuensche; Wünsche; Geburtstag; Party; Feier; Ticket; Souvenir; retail-store; e-commerce |
| Mobilidade | Carro | Carro – Combustível/Posto | Mobilität | Auto | Auto – Kraftstoff/Tankstelle | Tankstelle; Q1; Q1 REWE TANKSTELLE; Esso; Shell; Aral; Total; OMV; Benzin; Diesel; Kraftstoff; fueling; contactless |
| Mobilidade | Carro | Carro – Seguro | Mobilität | Auto | Auto – Versicherung | DEVK; DEVK Allgemeine; Kfz-Versicherung; Kfz Versicherung; Kennzeichen; FFB FA; Versicherung Nr; Beitrag; Einzug; Lastschrift; FOLGELASTSCHRIFT |
| Mobilidade | Carro | Carro – Estacionamento/Pedágio | Mobilität | Auto | Auto – Parken/Maut | Handyparken; HANDYPARKEN; Parkhaus; Parkhausbet; Parkschein; Parkplatz; Parking; Maut; TFL; contactless; Processed |
| Mobilidade | Carro | Carro – Multas/Infrações | Mobilität | Auto | Auto – Bußgeld/Verstöße | Stadt Mannheim; Bußgeld; Ordnungswidrigkeit; Strafzettel; Verwarnung; Aktenzeichen; online-ueberweisung; Rechnung; Verkehrsordnungswidrigkeit |
| Mobilidade | Transporte público | Transporte – MVV/Ônibus/Trem | Mobilität | Öffentlicher Verkehr | ÖPNV – MVV/Bus/Bahn | MVV; PAYPAL *MVV; Ticket; Monatskarte; Bahn; DB; Abellio; TFL TRAVEL; Oyster; Bus; Tram; ÖPNV; e-commerce; retail-store |
| Saúde & Seguros | Saúde | Médico/Clínica – PVS/consultas | Gesundheit & Versicherungen | Gesundheit | Arzt/Praxis – PVS/Behandlungen | PVS bayern; PVS Bayern GmbH; Rechnung; Rechnungsnr; Arzt; Praxis; Behandlung; ONLINE-UEBERWEISUNG; Medico; consulta; Gebühr |
| Saúde & Seguros | Saúde | Dentista/Ortodontia | Gesundheit & Versicherungen | Gesundheit | Zahnarzt/Kieferorthopädie | Kinderzahnheilkunde; Gemeinschaftspraxis; Zahn; Zahnarzt; Rechnungsnummer; Rechnungsnr; ONLINE-UEBERWEISUNG; Dental; KFO |
| Saúde & Seguros | Saúde | Farmácia | Gesundheit & Versicherungen | Gesundheit | Apotheke | Apotheke; APOTHEKE; APOTHEKE CENTER; ROSEN-APOTHEKE; Rezept; Pharma; Medikament; Arznei; contactless; retail-store; Processed |
| Saúde & Seguros | Saúde | Ótica e óculos (Compra) | Gesundheit & Versicherungen | Gesundheit | Optik & Brille (Kauf) | Apollo Optik; APOLLO OPTIK; Optik; Brille; Kontaktlinsen; Sehtest; contactless; retail-store; Processed; Authorised |
| Saúde & Seguros | Seguros | Seguro saúde – AOK | Gesundheit & Versicherungen | Versicherungen | Krankenversicherung – AOK | AOK; AOK Baden-Wuerttemberg; EINZUG BEITRAG; Beitrag; Krankenversicherung; FOLGELASTSCHRIFT; Lastschrift; LS WIEDERGUTSCHRIFT; Rückgabe Lastschrift |
| Saúde & Seguros | Seguros | Seguros – DEVK (Vida/Residencial/RC/Legal) | Gesundheit & Versicherungen | Versicherungen | Versicherungen – DEVK (Leben/Haftpflicht/Rechtsschutz etc.) | DEVK; Lebensversicherungsverein; DEVK Riehlerstrasse; Hausrat; Haftpflicht; Rechtsschutz; Leben; Haushaltglas; Beitrag; FOLGELASTSCHRIFT; Erstattung Rücklastschriftgebühren |
| Saúde & Seguros | Seguros | Seguro vida/financiamento – R+V | Gesundheit & Versicherungen | Versicherungen | Lebensversicherung/Finanzierung – R+V | R+V; R + V; Lebensversicherung; Darlehen; Zinsen; Tilgung; Beitrag; FOLGELASTSCHRIFT; Lastschrift |
| Educação & Crianças | Escola & taxas | Escola – Gymnasium Olching (Taxas/viagens/licenças) | Bildung & Kinder | Schule & Gebühren | Schule – Gymnasium Olching (Gebühren/Fahrten/Lizenzen) | Freistaat Bayern Gymnasium Olching; Gymnasium Olching; EPZ-; Schullandheim; Oberammergau; iPad-Jamf; Lizenz; bitte anweisen; ONLINE-UEBERWEISUNG; TERM. |
| Educação & Crianças | Benefícios família | Benefício – Kindergeld | Bildung & Kinder | Familienleistungen | Leistung – Kindergeld | Familienkasse; Bundesagentur fuer Arbeit; Kindergeld; KG; GUTSCHR. UEBERWEISUNG; Überweisung; Familienkasse; Zahlungseingang |
| Educação & Crianças | Atividades | Atividades – Cursos/clubes (Crianças) | Bildung & Kinder | Aktivitäten | Aktivitäten – Kurse/Vereine (Kinder) | Kurs; Verein; Beitrag; Anmeldung; Training; Musikschule; Sportverein; Mitgliedschaft; Teilnahmegebühr; Rechnung; Lastschrift |
| Lazer & Viagens | Viagens | Viagens – Hotéis | Freizeit & Reisen | Reisen | Reisen – Hotels | Hotel; Hilton; HILTON HOTELS; Novotel; NOVOTEL; Sheraton; SHERATON; booking; lodging; Aufenthalt; Processed; Authorised |
| Lazer & Viagens | Viagens | Viagens – Aluguel de carro (Car rental) | Freizeit & Reisen | Reisen | Reisen – Mietwagen | Hertz; HERTZ CAR RENTAL; car rental; Mietwagen; airport; travel; reservation; Processed; Authorised |
| Lazer & Viagens | Viagens | Viagens – Transferências internacionais (Wise/TransferWise) | Freizeit & Reisen | Reisen | Reisen – Internationale Transfers (Wise/TransferWise) | Wise; TRANSFERWISE; WISE; transferência; transferencia; envio; remessa; e-commerce; Processed; -internal; -interno |
| Lazer & Viagens | Entretenimento & eventos | Eventos – Ingressos/Tickets | Freizeit & Reisen | Freizeit & Events | Events – Tickets/Eintritt | Muenchen Ticket; München Ticket; LOGMVV; TICKETSHOP; Ticket; Eintritt; Konzert; Event; e-commerce; Processed; Authorised |
| Lazer & Viagens | Entretenimento & eventos | Lazer – Compras/serviços não essenciais | Freizeit & Reisen | Freizeit & Events | Freizeit – Sonstige Ausgaben | Freizeit; Spaß; Hobby; Spiel; Spielzeug; Entertainment; Bowling; Kino; Veranstaltung; retail-store; e-commerce |
| Interna | Pagamento de cartões | Pagamento – Amex (Liquidação/Fatura) | Finanzen & Transfers | Intern | Zahlung – Amex (Ausgleich/Abrechnung) | AMERICAN EXPRESS EUROPE; AMERICAN EXPRESS EUROPE S.A.; AXP; pagamento Amex; FOLGELASTSCHRIFT; EINMAL LASTSCHRIFT; ZAHLUNG ERHALTEN; ÜBERWEISUNG ERHALTEN; LS WIEDERGUTSCHRIFT; Representation |
| Interna | Pagamento de cartões | Pagamento – Miles & More / DKB (Liquidação) | Finanzen & Transfers | Intern | Zahlung – Miles & More / DKB (Ausgleich) | DEUTSCHE KREDITBANK; DKB; KREDITKARTENABRECHNUNG; Lufthansa Miles & More; ABRECHNUNG; pagamento M&M; Lastschrift; direct-debit; Sparkasse; DE98DKB |
| Finanças & Transferências | Transferências & Pix/PayPal | Transferência – PayPal (Top-up/withdraw) | Finanzen & Transfers | Überweisungen & PayPal | Transfer – PayPal (Auf-/Auszahlung) | PayPal Europe; PAYPAL; INSTANT TRANSFER; ECHTZEIT-GUTSCHRIFT; ABBUCHUNG VOM PAYPAL-KONTO; PP.; GUTSCHR. UEBERWEISUNG; Luxembourg; LU947510; LU897510 |
| Finanças & Transferências | Saque em dinheiro | Saque – Caixa eletrônico (Sparkasse/ATM) | Finanzen & Transfers | Bargeld | Bargeldabhebung – Geldautomat (Sparkasse/ATM) | BARGELDAUSZAHLUNG; GELDAUTOMAT; GA NR; SPARKASSE FUERSTENFELDBRUCK; OLCH-NORD; WESTSTADT; Debitk.; Karte; Abhebung; Bargeld; ATM |
| Finanças & Transferências | Taxas & juros | Taxas bancárias – Sparkasse | Finanzen & Transfers | Gebühren & Zinsen | Bankgebühren – Sparkasse | ENTGELTABSCHLUSS; Entgeltabrechnung; Entgelt; Gebühren; Kontoentgelt; Preis; Anlage; Sparkasse; Buchungsposten; -Zinsen |
| Finanças & Transferências | Taxas & juros | Juros/câmbio – Taxa internacional (1,95%) | Finanzen & Transfers | Gebühren & Zinsen | Auslandseinsatz/Wechselkursgebühr (1,95%) | 1,95% für Währungsumrechn; foreign-trx-fee; Auslandseinsatz; Währungsumrechnung; FX fee; compra internacional; USD; GBP; BRL; Processed; M&M |
| Finanças & Transferências | Taxas & juros | Mensalidade cartão – Miles & More | Finanzen & Transfers | Gebühren & Zinsen | Kartenentgelt – Miles & More | monatlicher Kartenpreis; product-fee; Kartenpreis; Monatsgebühr; Gebühr; Miles & More; M&M; Processed; -foreign-trx-fee |
| Finanças & Transferências | Taxas & juros | Taxas – Devolução/Retorno de débito (Chargeback/Lastschrift) | Finanzen & Transfers | Gebühren & Zinsen | Gebühren – Rücklastschrift/Retour (Chargeback) | RETOURNIERTE LASTSCHRIFT; Rückgabe Lastschrift; RECHNUNG Rückgabe; Gebühren für retournierte Lastschrift; Rücklastschriftgebühren; Representation; Chargeback; Erstattung; -Miete; -Strom |
| Finanças & Transferências | Dívidas & crédito | Crédito pessoal – ING DiBa (Rahmenkredit) | Finanzen & Transfers | Kredite & Schulden | Privatkredit – ING DiBa (Rahmenkredit) | ING-DiBa; Rahmenkredit; Tilgung; Zinsen; FOLGELASTSCHRIFT; Lastschrift; Kredit; Darlehen; 10/2025; DE65ING |
| Finanças & Transferências | Dívidas & crédito | Financiamento varejista – Apollo Optik (Parcelamento) | Finanzen & Transfers | Kredite & Schulden | Händlerfinanzierung – Apollo Optik (Raten) | Apollo-Optik Holding; Apollo-Optik; DP25-; FOLGELASTSCHRIFT; Lastschrift; Rechnung; Amsterdam; NL48ZZZ; Raten; Finanzierung |
| Finanças & Transferências | Dívidas & crédito | Empréstimo recebido – Targobank | Finanzen & Transfers | Kredite & Schulden | Kredit-Auszahlung – Targobank | TARGOBANK; INTERNET TARGOBANK; VIELEN DANK; GUTSCHR. UEBERWEISUNG; Auszahlung; Kredit; Darlehen; Vertrag; 0000728540; VINICIUS STEIGLEDER |
| Trabalho & Receitas | Salário | Salário – Vinicius (Bosch) | Arbeit & Einnahmen | Gehalt | Gehalt – Vinicius (Bosch) | Robert Bosch GmbH; LOHN GEHALT; Entgelt; Gehalt; Payroll; Gerlingen-Schillerhoehe; Entgelt 71336818; 10.2025; Überweisung; Gutschrift |
| Trabalho & Receitas | Salário | Salário – Erica (Transferência) | Arbeit & Einnahmen | Gehalt | Gehalt – Erica (Überweisung) | Fernanda Mendonca Finato; Julia Behr; GUTSCHR. UEBERWEISUNG; Gehalt; salário; pagamento; transferência; credit; Überweisung |
| Trabalho & Receitas | Receita profissional | Receita profissional – Clientes (PayPal/Überweisung) | Arbeit & Einnahmen | Selbstständig | Selbstständige Einnahmen – Kunden (PayPal/Überweisung) | Bianca De Freitas Lima; PAYPAL *biancaflima; PayPal; GUTSCHR. UEBERWEISUNG; Überweisung; invoice; serviço; atendimento; client; -refund; -Rückerstattung |
| Trabalho & Receitas | Vendas online | Vendas online – Vinted/Mangopay | Arbeit & Einnahmen | Online-Verkäufe | Online-Verkäufe – Vinted/Mangopay | Mangopay; Vinted; GUTSCHR. UEBERWEISUNG; Verkauf; venda; marketplace; AWV-MELDEPFLICHT; Rue du Fort Wallis; FR5221933; payout; Erlös |
| Trabalho & Receitas | Aluguel e rendas | Renda – Aluguel (Karlsruhe) | Arbeit & Einnahmen | Mieten & Pachten | Mieteinnahmen – Karlsruhe | Dr. David Mueller; Miete; Nebenkosten; Dauerauftrag; GUTSCHR. UEBERW. DAUERAUFTR; Karlsruhe; Knielingen; Mieteinnahme; Zahlungseingang |
| Doações & Outros | Doações/associações | Doação/Associação – Projeto social | Spenden & Sonstiges | Spenden/Vereine | Spende/Verein – Sozialprojekt | PAYPAL *BRUEDERLICH; BOG Mitglied; Mitglied; Beitrag; Spende; doação; donation; Verein; e-commerce; PayPal; -refund |
| Revisão & Não Classificado | Moradia – Geral (Revisão) | Moradia – Geral (Revisão) – Financiamento | Prüfung & Unkategorisiert | Wohnen – Allgemein (Prüfung) | Wohnen – Allgemein (Prüfung) – Finanzierung | Darlehen; Finanzierung; Hypothek; Kredit; Tilgung; Zinsen; FOLGELASTSCHRIFT; Lastschrift; -Commerzbank; -R+V; -Haus Olching; -Haus Karlsruhe; -Haus Esting |
| Revisão & Não Classificado | Moradia – Geral (Revisão) | Moradia – Geral (Revisão) – Nebenkosten/Condomínio | Prüfung & Unkategorisiert | Wohnen – Allgemein (Prüfung) | Wohnen – Allgemein (Prüfung) – Nebenkosten/Hausgeld | Nebenkosten; NK; Hausgeld; WEG; Hausverwaltung; Abrechnung; Vorauszahlung; Nachzahlung; Jahresabrechnung; Wohneinheit; Umlage; -loswohnen |
| Revisão & Não Classificado | Moradia – Geral (Revisão) | Moradia – Geral (Revisão) – Utilidades | Prüfung & Unkategorisiert | Wohnen – Allgemein (Prüfung) | Wohnen – Allgemein (Prüfung) – Versorger | Strom; Gas; Wasser; Heizung; Fernwärme; Abschlag; Energie; Versorger; Rechnung; Lastschrift; Einzug; -Vodafone; -LichtBlick; -KES |
| Revisão & Não Classificado | Moradia – Geral (Revisão) | Moradia – Geral (Revisão) – Manutenção/Reparos | Prüfung & Unkategorisiert | Wohnen – Allgemein (Prüfung) | Wohnen – Allgemein (Prüfung) – Instandhaltung/Reparaturen | Handwerker; Reparatur; Instandhaltung; Wartung; Service; Rechnung; Material; Notdienst; Hausmeister; Sanitär; Elektro; -Baumarkt |
| Revisão & Não Classificado | Moradia – Geral (Revisão) | Moradia – Geral (Revisão) – Materiais/Obras | Prüfung & Unkategorisiert | Wohnen – Allgemein (Prüfung) | Wohnen – Allgemein (Prüfung) – Materialien/Bau | Baustoff; Material; Bau; Baustelle; Renovierung; Ausbau; Handwerker; Rechnung; Lieferung; Montage; Projekt; -TEDI; -Amazon |
| Revisão & Não Classificado | Moradia – Geral (Revisão) | Moradia – Geral (Revisão) – Aluguel | Prüfung & Unkategorisiert | Wohnen – Allgemein (Prüfung) | Wohnen – Allgemein (Prüfung) – Miete | Miete; Monatsmiete; aluguel; rent; Dauerauftrag; DAUERAUFTRAG; Vermieter; Mieter; Nebenkosten; Kaltmiete; Warmmiete; -Schroeder; -David Mueller |
| Revisão & Não Classificado | Transferências pessoais | Transferência – Família/Amigos | Prüfung & Unkategorisiert | Private Transfers | Überweisung – Familie/Freunde | ONLINE-UEBERWEISUNG; GUTSCHR. UEBERWEISUNG; Überweisung; Te amo; Diogo Rodrigues Steigleder; Marion Schanz; Rechnung; IBAN; Sparkasse -; -PayPal; -LOHN GEHALT |
| Revisão & Não Classificado | Despesa não identificada | Despesa – Comerciante não identificado (Revisão) | Prüfung & Unkategorisiert | Unklare Ausgaben | Ausgabe – Händler unklar (Prüfung) | retail-store; e-commerce; contactless; Authorised; Processed; Rechnung; Verwendungszweck; Händler; merchant; -BARGELDAUSZAHLUNG; -KREDITKARTENABRECHNUNG |
| Revisão & Não Classificado | Receita não identificada | Receita – Entrada não identificada (Revisão) | Prüfung & Unkategorisiert | Unklare Einnahmen | Einnahme – Eingang unklar (Prüfung) | GUTSCHR. UEBERWEISUNG; Gutschrift; Zahlungseingang; credit; Überweisung; deposit; Erstattung; -Kindergeld; -LOHN GEHALT; -Miete |
