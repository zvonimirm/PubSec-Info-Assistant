import json
import re
import logging
import urllib.parse
from datetime import datetime, timedelta
from typing import Any, Sequence

import openai
from openai import  AsyncAzureOpenAI
from openai import BadRequestError
from approaches.approach import Approach
from azure.search.documents import SearchClient  
from azure.search.documents.models import RawVectorQuery
from azure.search.documents.models import QueryType
from azure.storage.blob import (
    BlobSasPermissions,
    BlobServiceClient,
    generate_blob_sas,
)
from text import nonewlines
from core.modelhelper import get_token_limit
import requests


class SalesPaketi(Approach):
    """Approach that uses a simple retrieve-then-read implementation, using the Azure AI Search and
    Azure OpenAI APIs directly. It first retrieves top documents from search, combines it with data from request,
    then constructs a prompt with them, and then uses Azure OpenAI to generate
    an completion (answer) with that prompt."""


    SYSTEM_MESSAGE_CHAT_CONVERSATION_HR = """ 
        Ti si chat agentica za Zagrebačku banku (Zaba), specijalizirana za PAKETE bankovnih usluga. Profesionalna si, korisna i efikasna.  
        Fokusiraš se na pogodnosti i uštedu koje paketi donose.
        Tečno govoriš hrvatski. Tvoje ime je Mia. Koristiš kratke, jasne poruke i postavljaš pitanja kako bi održala angažman klijenta.

        Tvoj cilj je informirati klijenta o prednostima bankovnih paketa i potaknuti ga da ugovori odgovarajući paket. 
        Znaš koje pakete korisnik trenutno koristi i trebaš mu ponuditi odgovarajući paket. 
        Tvoj konačni cilj je pridobiti klijente za ugovaranje paketa, bilo kroz neposrednu aplikaciju putem m-zabe, zakazivanje video poziva ili dogovaranje posjeta poslovnici.

        Uvod:
        Ako ti je korisnik rekao da nema vremena procijeni.Ako je nesigurno rekao (Ne baš, imam jako malo...) 
        Reci da razumiješ i da znaš da je vrijeme jako dragocijeno. Kaži da će stvarno trajati manje od minute i nastavi s koracima.
        Ako kaže agresivno da nema uopće vremena ili da je zabunom tu. Zahvali mu se i pozdravi.

        Prvi korak:

        Klijent ti je već rekao svoje ime i paket koji koristi. Pokušaj mu predstaviti samo kompleksnije pakete od trenutnog. 
        Ako je paket Other, to znači da mu možeš predstaviti sve pakete.
        Ako korisnik koristi paket START, ponudi mu SMART i SUPERIOR. 
        Ako koristi SMART, ponudi mu samo SUPERIOR.
        Ako već koristi SUPERIOR, budi jako pristojna i reci da već ima najbolji mogući paket. Zahvali se. I pozdravi se korisnikom.

        Drugi korak:
        
        Nakon što si definirala koje pakete prodaješ postavi jedno po jedno pitanje korisniku da vidiš što će ga zanimati.
        Pitanja koja želiš saznati su navike korisnika. Recimo:
        - Ima li vozilo?
        - Putuje li često?
        - Imate li već vlastitu nekretninu?
        - Koliko transakcija plaćate mjesečno?
        Ukoliko korisnik ima nekretninu, predloži mu superior zbog usluga asistencije.
        Ako plaća manje od 20 transakcija, predloži mu smart.
        Ako ima other i nema vozilo, predloži mu start.

        Prema tome odaberi neki od paketa koji će bit prikladan.
        2-3 pitanja, ne više.
        
        START - Za osnovne potrebe, mlađe klijente, one s manjim prometom
        SMART - Za aktivne klijente koji putuju, imaju vozilo, koriste digitalne usluge
        SUPERIOR  - Za premium klijente koji žele maksimalnu zaštitu i usluge

        Nako toga prezentiraj jedan paket koji smatraš da je prikladan.

        Treći korak: Prezentacija Paketa

        START PAKET (5,90 EUR mjesečno)
        Paket je savršeno rješenje za Vas koji uključuje:
        - Plaćanje režija – besplatne transakcije (do 5 transakcija mjesečno)
        - Mobilno i online bankarstvo – niže naknade za plaćanje računa putem digitalnih kanala
        - Tekući i multivalutni račun – upravljanje domaćim i deviznim sredstvima na istom računu
        - Limit obročnog plaćanja – Plaćanje karticom sa tekućeg računa u eurima na rate do 2.700 EUR, bez kamata i naknada
        - Dopušteno prekoračenje – Maksimalno do 7.000 EUR (ovisno o kreditnoj sposobnosti)
        - Podizanje gotovine bez naknade – Na bankomatima UniCredit Grupe u inozemstvu

        

        SMART PAKET (11,50 EUR mjesečno)
        Dizajniran je kako biste jednostavnije upravljali svojim financijama s dodatnim uslugama:

        **Financijske pogodnosti:**
        - Besplatno plaćanje režija – prvih 20 transakcija bez naknade
        - Mobilno i online bankarstvo – niže naknade za plaćanja
        - Tekući, devizni i žiro račun – sve na jednom mjestu
        - Plaćanje na rate bez kamata i naknada – do 2.700 EUR
        - Dopušteno prekoračenje – do 7.000 EUR
        - Kreditna Mastercard kartica – bez upisnine i naknade
        - Podizanje gotovine u inozemstvu bez naknade

        **PLUS Servis centar koji omogućuje:**
        - 🔧 Hitne intervencije u kući (vodoinstalater, električar, bravar, krovopokrivač, staklar)
        - 🚗 Pomoć na cesti (kvar vozila, prometna nesreća, manjak goriva, krađa vozila)
        - 💳 Zaštita digitalnog novčanika – do 500 EUR po odštetnom zahtjevu

        SUPERIOR PAKET (17,00 EUR mjesečno)
        Idealno rješenje za maksimalnu fleksibilnost, sigurnost i uštedu:

        **Sve prednosti SMART paketa PLUS:**
        - ✅ Neograničen broj besplatnih transakcija za režije
        - ✈️ Putno zdravstveno osiguranje i osiguranje od otkaza putovanja
        - 📱 Osiguranje od krađe i zloupotrebe mobilnog uređaja
        - 🛡️ Cyber Shield – zaštita od online rizika
        - 🔝 Premium asistencija – prošireni Servis centar

        Što Vi mislite o ovom paketu? Mislim da bi Vam mogao značajno olakšati svakodnevne financijske i sigurnosne situacije.

       Četvri korak:
       Pondi korisniku opcije ugovoranja. 
       Prvo ga pitaj želi li odmah ugovoriti. ako nije sto posto siguran da želi odmah, pitaj ga
       želi li video poziv.

        Ako kaže da želi ugovoriti sada u ovoj konverzaciji:
        U redu, za koji trenutak ćete primiti push poruku koja će Vas voditi u m-zabu na ekran za ugovaranje gotovinskog kredita. 
        Možemo zajedno proći kroz proces, pomoći ću Vam ako imate pitanja.

        Ako kaže da će želi push ali će još razmisliti:
        U redu, za koji trenutak ćete primiti push poruku koja će Vas voditi u m-zabu na ekran za ugovaranje gotovinskog kredita. 
        Kao što sam već rekao, možete provjeriti uvjete kredita i donijeti odluku kada Vama to bude najviše odgovaralo.

        Ako želi ugovoriti video poziv:
        U redu, na Vašu verificiranu e-mail adresu poslat ću Vam link za videopoziv. Koje vrijeme Vam odgovara? 

        Ako želi ugovaranje sastanka u poslovnici:
        Pitaj korisnika naziv poslovnice koja mu najviše odgovara. Pitaj ga za vrijeme i datum.
        Ako ne zna datum, kaži mu: U tom slučaju si možete sami ugovoriti sastanak na m-zabi ili na našem  web-u www.zaba.hr


        Pravila Rukovanja Chat Razgovorom:
        Slijedi redoslijed kroka


        Reakcija na poruke korisnika:

        Ako korisnik kaže: Previše je skupo" ti kaži:
        Razumijem Vašu zabrinutost. 💰 Međutim, s obzirom na sve usluge koje dobivate, često se isplati. Na primjer, samo jedna intervencija vodoinstalatera može koštati više od mjesečne naknade paketa.

        Ako korisnik kaže: Ne trebam sve te usluge" ti kaži:
        To je razumljivo. Koji dio Vam se čini najkorisniji? Možda bismo mogli pronaći paket koji bolje odgovara Vašim potrebama.

        Ako korisnik kaže: "Već imam osiguranje": ti kaži:
        Odlično što ste osigurani! 🛡️ Ovi paketi nude dodatnu zaštitu specifično za bankovne usluge i svakodnevne situacije koje možda nisu pokrivene Vašim postojećim osiguranjem.

        Zadnji korak: kraj komunikacije

        **Nakon uspješne akcije:**
        Hvala Vam na vremenu! Link je poslan / Termin je potvrđen. 
        Ako imate dodatnih pitanja, slobodno pišite!

        **Nakon odbijanja:**
        Razumijem. Hvala Vam na vremenu. 💬 Ako se situacija promijeni, uvijek možete kontaktirati banku. 
        Ugodan dan!

        ---

        # Važne Napomene

        - **STRIKTNO slijedi strukturu A-D korak po korak**
        - **Fokusiraj se na uštedu i dodatnu vrijednost, ne na prodaju**
        - **Koristi točne mjesečne naknade: START 5,90 EUR, SMART 11,50 EUR, SUPERIOR 17,00 EUR**
        - **Naglasi prednosti Servis centra za SMART i SUPERIOR pakete**
        - **Budi perzistentna ali poštovana - ne pritisci agresivno**
        - **Koristi chat-friendly formatiranje (emojiji, bullet points, kratki paragrafi)**
        - **Uvijek ostani profesionalna i ljubazna**
        - **Ukoliko ti netko kaže da ima START ili SMART paket, nastoji prodati veći paket od postojećeg**
        - **Pristupi prodaji polu-agresivno, nemoj odustajati od prodaje bez obzira na to što klijenti rekli**
        - **Odgovaraj kratko i jasno - chat korisnici preferiraju brže komunikacije**

    {injected_prompt}
    """

    SYSTEM_MESSAGE_CHAT_CONVERSATION = """ 
    You are an Azure OpenAI Completion system, named Finley. Your persona is {systemPersona} and your user persona is {userPersona}.
   
    {injected_prompt}
    """
    FOLLOW_UP_QUESTIONS_PROMPT_CONTENT = """ALWAYS generate three very brief unordered follow-up questions surrounded by triple chevrons (<<<Are there exclusions for prescriptions?>>>) that the user would likely ask next about their agencies data. 
    Surround each follow-up question with triple chevrons (<<<Are there exclusions for prescriptions?>>>). Try not to repeat questions that have already been asked.
    Only generate follow-up questions and do not generate any text before or after the follow-up questions, such as 'Next Questions'
    """
    QUERY_PROMPT_TEMPLATE_HR = """    """
    QUERY_PROMPT_TEMPLATE = """    """
    
    QUERY_PROMPT_FEW_SHOTS_HR = [
        {'role' : Approach.USER, 'content' : 'Predstavaljam se' },
        {'role' : Approach.ASSISTANT, 'content' : 'Drago mi je upoznati vas! Da mogu bolje prilagoditi preporuke, recite mi tražite li rješenje za neku specifičnu potrebu ili općenito istražujete naše usluge.'},
        
        
        {'role' : Approach.USER, 'content' : 'Planiram kupiti stan' },
        {'role' : Approach.ASSISTANT, 'content' : 'Jako lijepo! Čestitam! U vašem projektu sigurno će vam pomoći Zagrebačka banka!' },
        
        {'role': Approach.USER, 'content': 'Plaća mi stiže na vaš račun'},
        {'role': Approach.ASSISTANT, 'content': 'Super! Možda bi vas zanimale dodatne pogodnosti za redovite klijente? '}
    ]

    RESPONSE_PROMPT_FEW_SHOTS_HR = [
        # {'role': Approach.USER, 'content': 'Predstavlja se'},
        # {"role": Approach.ASSISTANT ,'content': 'Drago mi je upoznati vas! Da mogu bolje prilagoditi preporuke - tražite li rješenje za neku specifičnu potrebu ili općenito istražujete naše usluge?'},
        # {'role': Approach.USER, 'content': 'Trebam kredit za kupnju automobila'},
        # {"role": Approach.ASSISTANT ,'content': 'Odličo! Kredit za vozilo je jedna od naših najtraženijih usluga.'},
    ]


    QUERY_PROMPT_FEW_SHOTS = [
        {'role': Approach.ASSISTANT, 'content': 'Hello? I am Finley. What is your name?'},
        {'role' : Approach.USER, 'content' : 'name_user_entered' },
        {'role' : Approach.ASSISTANT, 'content' : 'Nice to meet you name_user_entered! What company do you work for?'},
        {'role' : Approach.USER, 'content' : 'Asee Solutions' },
    ]

    RESPONSE_PROMPT_FEW_SHOTS = [
        {'role': Approach.ASSISTANT, 'content': 'Hello? I am Finley. What is your name?'},
        {"role": Approach.USER ,'content': 'John'},
    ]

    def __init__(
        self,
        search_client: SearchClient,
        oai_endpoint: str,
        chatgpt_deployment: str,
        source_file_field: str,
        content_field: str,
        page_number_field: str,
        chunk_file_field: str,
        content_storage_container: str,
        blob_client: BlobServiceClient,
        query_term_language: str,
        model_name: str,
        model_version: str,
        target_embedding_model: str,
        enrichment_appservice_uri: str,
        target_translation_language: str,
        azure_ai_endpoint:str,
        azure_ai_location:str,
        azure_ai_token_provider:str,
        use_semantic_reranker: bool,
        language: str = "en",
    ):
        self.search_client = search_client
        self.chatgpt_deployment = chatgpt_deployment
        self.source_file_field = source_file_field
        self.content_field = content_field
        self.page_number_field = page_number_field
        self.chunk_file_field = chunk_file_field
        self.content_storage_container = content_storage_container
        self.blob_client = blob_client
        self.query_term_language = query_term_language
        self.chatgpt_token_limit = get_token_limit(model_name)
        #escape target embeddiong model name
        self.escaped_target_model = re.sub(r'[^a-zA-Z0-9_\-.]', '_', target_embedding_model)
        self.target_translation_language=target_translation_language
        self.azure_ai_endpoint=azure_ai_endpoint
        self.azure_ai_location=azure_ai_location
        self.azure_ai_token_provider=azure_ai_token_provider
        self.oai_endpoint=oai_endpoint
        self.embedding_service_url = enrichment_appservice_uri
        self.use_semantic_reranker=use_semantic_reranker
        self.language = language
        
        openai.api_base = oai_endpoint
        openai.api_type = 'azure'
        openai.api_version = "2024-02-01"
        
        self.client = AsyncAzureOpenAI(
        azure_endpoint = openai.api_base,
        azure_ad_token_provider=azure_ai_token_provider,
        api_version=openai.api_version)
               

        self.model_name = model_name
        self.model_version = model_version
        
    async def run(self, history: Sequence[dict[str, str]], overrides: dict[str, Any], citation_lookup: dict[str, Any], thought_chain: dict[str, Any]) -> Any:

        log = logging.getLogger("uvicorn")
        log.setLevel('DEBUG')
        log.propagate = True

        chat_completion = None
        use_semantic_captions = True if overrides.get("semantic_captions") else False
        top = overrides.get("top") or 3
        user_persona = overrides.get("user_persona", "")
        system_persona = overrides.get("system_persona", "")
        response_length = int(overrides.get("response_length") or 1024)
        folder_filter = overrides.get("selected_folders", "")
        tags_filter = overrides.get("selected_tags", "")
        language = overrides.get("language", "")
        user_q = 'Generate search query for: ' + history[-1]["user"]
        
        thought_chain["work_query"] = user_q
        
        # Detect the language of the user's question
        
        self.query_term_language = language
        
        detectedlanguage = language #or self.detect_language(user_q)
        if detectedlanguage != self.target_translation_language:
            user_question = self.translate_response(user_q, self.target_translation_language)
        else:
            user_question = user_q

        prompt_language = language #or self.query_term_language
        query_prompt=self.QUERY_PROMPT_TEMPLATE.format(query_term_language=prompt_language)

        # STEP 1: Generate an optimized keyword search query based on the chat history and the last question
        messages = self.get_messages_from_history(
            query_prompt,
            self.model_name,
            history,
            user_question,
            self.QUERY_PROMPT_FEW_SHOTS,
            self.chatgpt_token_limit - len(user_question)
            )

        try:
            chat_completion= await self.client.chat.completions.create(
                    model=self.chatgpt_deployment,
                    messages=messages,
                    temperature=0.0,
                    # max_tokens=32, # setting it too low may cause malformed JSON
                    max_tokens=100,
                n=1)
                # Initialize a list to collect filter reasons
            filter_reasons = []

            # Check for content filtering
            if chat_completion.choices[0].finish_reason == 'content_filter':
                for category, details in chat_completion.choices[0].content_filter_results.items():
                    if details['filtered']:
                        filter_reasons.append(f"{category} ({details['severity']})")

            # Raise an error if any filters are triggered
            if filter_reasons:
                error_message = "The generated content was filtered due to triggering Azure OpenAI's content filtering system. Reason(s): The response contains content flagged as " + ", ".join(filter_reasons)
                raise ValueError(error_message)
        except BadRequestError as e:
            log.error(f"Error generating optimized keyword search: {str(e.body['message'])}")
            yield json.dumps({"error": f"Error generating optimized keyword search: {str(e.body['message'])}"}) + "\n"
            return
        except Exception as e:
            log.error(f"Error generating optimized keyword search: {str(e)}")
            yield json.dumps({"error": f"Error generating optimized keyword search: {str(e)}"}) + "\n"
            return

        generated_query = chat_completion.choices[0].message.content
        
        #if we fail to generate a query, return the last user question
        if generated_query.strip() == "0":
            generated_query = history[-1]["user"]

        thought_chain["work_search_term"] = generated_query
        
        # Generate embedding using REST API
        url = f'{self.embedding_service_url}/models/{self.escaped_target_model}/embed'
        log.info(f"Generating embedding for url: {self.embedding_service_url}")    
        data = [f'"{generated_query}"']
        
        headers = {
                'Accept': 'application/json',  
                'Content-Type': 'application/json',
            }

        embedded_query_vector = None
        try:
            log.info(f"Generating embedding for url: {url}")
            response = requests.post(url, json=data,headers=headers,timeout=60)
            if response.status_code == 200:
                response_data = response.json()
                embedded_query_vector =response_data.get('data')
            else:
                # Generate an error message if the embedding generation fails
                log.error(f"Error generating embedding:: {response.status_code} - {response.text}")
                yield json.dumps({"error": "Error generating embedding"}) + "\n"
                return # Go no further
        except Exception as e:
            # Timeout or other error has occurred
            log.error(f"Error generating embedding: {str(e)}")
            yield json.dumps({"error": f"Error generating embedding: {str(e)}"}) + "\n"
            return # Go no further
        
        #vector set up for pure vector search & Hybrid search & Hybrid semantic
        vector = RawVectorQuery(vector=embedded_query_vector, k=top, fields="contentVector")

        #Create a filter for the search query
        if (folder_filter != "") & (folder_filter != "All"):
            search_filter = f"search.in(folder, '{folder_filter}', ',')"
        else:
            search_filter = None
        if tags_filter != "" :
            if search_filter is not None:
                search_filter = search_filter + f" and tags/any(t: search.in(t, '{tags_filter}', ','))"
            else:
                search_filter = f"tags/any(t: search.in(t, '{tags_filter}', ','))"

        # Hybrid Search
        # r = self.search_client.search(generated_query, vector_queries =[vector], top=top)

        # Pure Vector Search
        # r=self.search_client.search(search_text=None,vector_queries =[vector], top=top)
        
        # vector search with filter
        # r=self.search_client.search(search_text=None, vectors=[vector], filter="processed_datetime le 2023-09-18T04:06:29.675Z" , top=top)
        # r=self.search_client.search(search_text=None, vectors=[vector], filter="search.ismatch('upload/ospolicydocs/China, climate change and the energy transition.pdf', 'file_name')", top=top)

        #  hybrid semantic search using semantic reranker
        if (self.use_semantic_reranker and overrides.get("semantic_ranker")):
            r = self.search_client.search(
                generated_query,
                query_type=QueryType.SEMANTIC,
                semantic_configuration_name="default",
                top=top,
                query_caption="extractive|highlight-false"
                if use_semantic_captions else None,
                vector_queries =[vector],
                filter=search_filter
            )
        else:
            r = self.search_client.search(
                generated_query, top=top,vector_queries=[vector], filter=search_filter
            )

        citation_lookup = {}  # dict of "FileX" moniker to the actual file name
        results = []  # list of results to be used in the prompt
        data_points = []  # list of data points to be used in the response

        #  #print search results with score
        # for idx, doc in enumerate(r):  # for each document in the search results
        #     print(f"File{idx}: ", doc['@search.score'])

        # cutoff_score=0.01
        # # Only include results where search.score is greater than cutoff_score
        # filtered_results = [doc for doc in r if doc['@search.score'] > cutoff_score]
        # # print("Filtered Results: ", len(filtered_results))

        for idx, doc in enumerate(r):  # for each document in the search results
            # include the "FileX" moniker in the prompt, and the actual file name in the response
            results.append(
                f"File{idx} " + "| " + nonewlines(doc[self.content_field])
            )
            data_points.append(
               "/".join(urllib.parse.unquote(doc[self.source_file_field]).split("/")[1:]
                ) + "| " + nonewlines(doc[self.content_field])
                )
            # uncomment to debug size of each search result content_field
            # print(f"File{idx}: ", self.num_tokens_from_string(f"File{idx} " + /
            #  "| " + nonewlines(doc[self.content_field]), "cl100k_base"))

            # add the "FileX" moniker and full file name to the citation lookup
            citation_lookup[f"File{idx}"] = {
                "citation": urllib.parse.unquote("https://" + self.blob_client.url.split("/")[2] + f"/{self.content_storage_container}/" + doc[self.chunk_file_field]),
                "source_path": doc[self.source_file_field],
                "page_number": str(doc[self.page_number_field][0]) or "0",
             }
            
        # create a single string of all the results to be used in the prompt
        results_text = "".join(results)
        if results_text == "":
            content = "\n NONE"
        else:
            content = "\n " + results_text

        # STEP 3: Generate the prompt to be sent to the GPT model
        follow_up_questions_prompt = (
            self.FOLLOW_UP_QUESTIONS_PROMPT_CONTENT
            if overrides.get("suggest_followup_questions")
            else ""
        )

        # Allow client to replace the entire prompt, or to inject into the existing prompt using >>>
        prompt_override = overrides.get("prompt_template")

        if prompt_override is None:
            if language == "hr":
                system_message = self.SYSTEM_MESSAGE_CHAT_CONVERSATION_HR.format(
                    query_term_language=self.query_term_language,
                    injected_prompt="",
                    follow_up_questions_prompt=follow_up_questions_prompt,
                    response_length_prompt=self.get_response_length_prompt_text(
                        response_length
                    ),
                    userPersona=user_persona,
                    systemPersona=system_persona,
                )
            else:
                system_message = self.SYSTEM_MESSAGE_CHAT_CONVERSATION.format(
                    query_term_language=self.query_term_language,
                    injected_prompt="",
                    follow_up_questions_prompt=follow_up_questions_prompt,
                    response_length_prompt=self.get_response_length_prompt_text(
                        response_length
                    ),
                    userPersona=user_persona,
                    systemPersona=system_persona,
                )
        elif prompt_override.startswith(">>>"):
            system_message = self.SYSTEM_MESSAGE_CHAT_CONVERSATION.format(
                query_term_language=self.query_term_language,
                injected_prompt=prompt_override[3:] + "\n ",
                follow_up_questions_prompt=follow_up_questions_prompt,
                response_length_prompt=self.get_response_length_prompt_text(
                    response_length
                ),
                userPersona=user_persona,
                systemPersona=system_persona,
            )
        else:
            system_message = self.SYSTEM_MESSAGE_CHAT_CONVERSATION.format(
                query_term_language=self.query_term_language,
                follow_up_questions_prompt=follow_up_questions_prompt,
                response_length_prompt=self.get_response_length_prompt_text(
                    response_length
                ),
                userPersona=user_persona,
                systemPersona=system_persona,
            )
            
        try:
            # STEP 3: Generate a contextual and content-specific answer using the search results and chat history.
            #Added conditional block to use different system messages for different models.

            if language == "hr":
                messages = self.get_messages_from_history(
                system_message,
                # "Sources:\n" + content + "\n\n" + system_message,
                self.model_name,
                history,
                # history[-1]["user"],
                history[-1]["user"] + "Sources:\n" + content + "\n\n", # GPT 4 starts to degrade with long system messages. so moving sources here 
                self.RESPONSE_PROMPT_FEW_SHOTS_HR,
                max_tokens=self.chatgpt_token_limit
            )
            else:
                messages = self.get_messages_from_history(
                system_message,
                # "Sources:\n" + content + "\n\n" + system_message,
                self.model_name,
                history,
                # history[-1]["user"],
                history[-1]["user"] + "Sources:\n" + content + "\n\n", # GPT 4 starts to degrade with long system messages. so moving sources here 
                self.RESPONSE_PROMPT_FEW_SHOTS,
                max_tokens=self.chatgpt_token_limit
            )
            # Generate the chat completion
            chat_completion= await self.client.chat.completions.create(
                model=self.chatgpt_deployment,
                messages=messages,
                temperature=float(overrides.get("response_temp")) or 0.6,
                n=1,
                stream=True
            
            )
            msg_to_display = '\n\n'.join([str(message) for message in messages])
        
        
            # Return the data we know
            yield json.dumps({"data_points": data_points,
                              "thoughts": f"Traženo:<br>{generated_query}<br><br>Razgovor:<br>" + msg_to_display.replace('\n', '<br>'),
                              "thought_chain": thought_chain,
                              "work_citation_lookup": citation_lookup,
                              "web_citation_lookup": {}}) + "\n"
            
            # STEP 4: Format the response
            async for chunk in chat_completion:
                # Check if there is at least one element and the first element has the key 'delta'
                if len(chunk.choices) > 0:
                    filter_reasons = []
                    # Check for content filtering
                    if chunk.choices[0].finish_reason == 'content_filter':
                        for category, details in chunk.choices[0].content_filter_results.items():
                            if details['filtered']:
                                filter_reasons.append(f"{category} ({details['severity']})")

                    # Raise an error if any filters are triggered
                    if filter_reasons:
                        error_message = "The generated content was filtered due to triggering Azure OpenAI's content filtering system. Reason(s): The response contains content flagged as " + ", ".join(filter_reasons)
                        raise ValueError(error_message)
                    yield json.dumps({"content": chunk.choices[0].delta.content}) + "\n"
        except BadRequestError as e:
            log.error(f"Error generating chat completion: {str(e.body['message'])}")
            yield json.dumps({"error": f"Error generating chat completion: {str(e.body['message'])}"}) + "\n"
            return
        except Exception as e:
            log.error(f"Error generating chat completion: {str(e)}")
            yield json.dumps({"error": f"Error generating chat completion: {str(e)}"}) + "\n"
            return

    def detect_language(self, text: str) -> str:
        """ Function to detect the language of the text"""
        try:
            api_detect_endpoint = f"{self.azure_ai_endpoint}language/:analyze-text?api-version=2023-04-01"
            headers = {
                'Authorization': f'Bearer {self.azure_ai_token_provider()}',
                'Content-type': 'application/json',
                'Ocp-Apim-Subscription-Region': self.azure_ai_location
            }

            data = {
                "kind": "LanguageDetection",
                "analysisInput":{
                    "documents":[
                        {
                            "id":"1",
                            "text": text
                        }
                    ]
                }
            } 

            response = requests.post(api_detect_endpoint, headers=headers, json=data)

            if response.status_code == 200:
                detected_language = response.json()["results"]["documents"][0]["detectedLanguage"]["iso6391Name"]
                return detected_language
            else:
                raise Exception(f"Error detecting language: {response.status_code} - {response.text}")
        except Exception as e:
            raise Exception(f"An error occurred during language detection: {str(e)}") from e
    
    def translate_response(self, response: str, target_language: str) -> str:
        """ Function to translate the response to target language"""
        api_translate_endpoint = f"{self.azure_ai_endpoint}translator/text/v3.0/translate?api-version=3.0"
        headers = {
            'Authorization': f'Bearer {self.azure_ai_token_provider()}',
            'Content-type': 'application/json',
            'Ocp-Apim-Subscription-Region': self.azure_ai_location
        }
        params={'to': target_language }
        data = [{
            "text": response
        }]          
        response = requests.post(api_translate_endpoint, headers=headers, json=data, params=params)
        
        if response.status_code == 200:
            translated_response = response.json()[0]['translations'][0]['text']
            return translated_response
        else:
            raise Exception(f"Error translating response: {response.status_code}")

    def get_source_file_with_sas(self, source_file: str) -> str:
        """ Function to return the source file with a SAS token"""
        try:
            separator = "/"
            file_path_w_name_no_cont = separator.join(
                source_file.split(separator)[4:])
            container_name = separator.join(
                source_file.split(separator)[3:4])
            # Obtain the user delegation key
            user_delegation_key = self.blob_client.get_user_delegation_key(key_start_time=datetime.utcnow(), key_expiry_time=datetime.utcnow() + timedelta(hours=2))

            sas_token = generate_blob_sas(
                account_name=self.blob_client.account_name,
                container_name=container_name,
                blob_name=file_path_w_name_no_cont,
                user_delegation_key=user_delegation_key,
                permission=BlobSasPermissions(read=True),
                expiry=datetime.utcnow() + timedelta(hours=1),
            )
            return source_file + "?" + sas_token
        except Exception as error:
            logging.error(f"Unable to parse source file name: {str(error)}")
            return ""