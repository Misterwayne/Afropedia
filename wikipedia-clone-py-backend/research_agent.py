# populate_db_agent.py
import asyncio
import os
import json
from dotenv import load_dotenv
from typing import List, Optional, Dict, Any

# --- LangChain Imports ---
# LLM
from langchain_groq import ChatGroq
# Prompts
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.messages import AIMessage, HumanMessage, SystemMessage
# Tools
from langchain.tools import Tool
from langchain_community.tools import DuckDuckGoSearchRun
from langchain_community.tools.tavily_search import TavilySearchResults
# Agents
from langchain.agents import AgentExecutor, create_tool_calling_agent
# Output Parsing & Schemas
from langchain.output_parsers.openai_tools import PydanticToolsParser
from langchain_core.pydantic_v1 import BaseModel, Field # Use v1 for tool definitions

# --- Local Imports ---
# Pydantic schemas for desired FINAL output
from agent_schema import ArticleOutput
# Project database, CRUD, and models
from database import get_session, AsyncSession
from crud import article_crud # Assuming article_crud has create_article_with_revision
from models import ArticleCreate # Schema for creating DB entry

# --- Load Environment Variables ---
load_dotenv()
print("Environment variables loaded.")

# --- Configuration ---
GROQ_API_KEY = "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"
TAVILY_API_KEY = os.getenv("TAVILY_API_KEY") # Optional, for Tavily search
GROQ_MODEL_NAME = os.getenv("GROQ_MODEL_NAME", "meta-llama/llama-4-scout-17b-16e-instruct") # Default model
AI_USER_ID = int(os.getenv("AI_USER_ID", 1)) # Default to user ID 1 if not set

print(f"Using Groq Model: {GROQ_MODEL_NAME}")
print(f"Using AI User ID: {AI_USER_ID}")

# --- Custom Error ---
class AgentProcessingError(Exception):
    """Custom exception for agent processing failures."""
    pass

# --- Initialize LLM ---
if not GROQ_API_KEY:
    raise ValueError("GROQ_API_KEY environment variable not set. Please get one from GroqCloud.")

llm = ChatGroq(
    temperature=0.1, # Low temperature for factual, consistent output
    model_name=GROQ_MODEL_NAME,
    groq_api_key=GROQ_API_KEY,
)
print("ChatGroq LLM Initialized.")

# --- Define Tools ---
search_tools = []
try:
    if TAVILY_API_KEY:
        print("Tavily API Key found. Initializing Tavily Search...")
        tavily_search = TavilySearchResults(max_results=5, api_key=TAVILY_API_KEY)
        search_tools.append(
            Tool(
                name="tavily_search_results_json",
                func=tavily_search.run,
                description="A search engine optimized for comprehensive, accurate results. Use this to find information, verify facts, and get source URLs about events, concepts, people, etc., related ONLY to the specific topic being researched."
            )
        )
        print("Tavily Search tool added.")
    else:
        print("Tavily API Key not found. Initializing DuckDuckGo Search...")
        duckduckgo_search = DuckDuckGoSearchRun()
        search_tools.append(
            Tool(
                name="duckduckgo_search",
                func=duckduckgo_search.run,
                description="A standard search engine. Use this to find information, verify facts, and get source URLs on various topics related ONLY to the specific topic being researched."
            )
        )
        print("DuckDuckGo Search tool added.")
except ImportError as e:
     print(f"Import error for search tool: {e}. Search functionality might be limited.")
except Exception as e:
     print(f"Error initializing search tools: {e}. Search functionality might be limited.")

if not search_tools:
    print("!!! WARNING: No search tools initialized. Agent cannot verify information via web search. !!!")


# --- Define Output Tool Schema ---
class ArticleGenerationToolSchema(BaseModel):
     """Use this tool ONLY to provide the final generated article title, content, and sources list once ALL research and writing is complete."""
     title: str = Field(description="The final, accurate, and neutral article title.")
     content: str = Field(description="The final, well-structured Markdown article content based on research.")
     sources: List[str] = Field(description="List of 3-5 reliable source URLs used to verify information.")

# --- Bind Tools to LLM ---
# Bind the output schema and search tools so the LLM knows about them
# Do *not* force tool_choice here initially.
try:
    llm_with_tools = llm.bind_tools([ArticleGenerationToolSchema] + search_tools)
    print("LLM bound with Output Schema and Search Tools.")
except Exception as e:
    print(f"Error binding tools to LLM: {e}")
    # Handle error appropriately, maybe exit or proceed without tool binding if safe
    llm_with_tools = llm # Fallback? Risky.

# --- Define Agent Prompt ---
article_agent_system_prompt_text = """You are an expert encyclopedia writer AI assistant. Your primary goal is to write an accurate, neutral, and well-structured encyclopedia article **strictly about the given {topic}**.

**Your Required Process:**
1.  **Research the Topic:** You MUST use the available search tool (`tavily_search_results_json` or `duckduckgo_search`) **exclusively to find reliable information and verify facts about the specific {topic} provided**. Do NOT search for writing instructions or general knowledge. Focus your searches on '{topic}'. Multiple searches may be necessary.
2.  **Synthesize Findings:** Based *only* on the information gathered about '{topic}' from your reliable search results, synthesize it into a Markdown article. Use headings (#, ##), paragraphs, lists, and appropriate [[Wikilinks]] related directly to '{topic}'. Maintain a neutral, encyclopedic tone.
3.  **Cite Sources:** You MUST list the URLs of the 3-5 most relevant and reliable sources **you consulted about '{topic}'** while writing the content. Ensure these URLs are valid.
4.  **Final Output Tool:** **CRITICAL FINAL STEP:** After completing all research, writing, and source collection, you **MUST** format your entire final response using the **'ArticleGenerationToolSchema' tool**. Provide the final title, the complete markdown content, and the list of source URLs within this tool call. Your absolute final action must be to call this tool. Do not output the article as plain text before or after the tool call."""

article_agent_system_prompt = SystemMessage(content=article_agent_system_prompt_text)

article_agent_prompt = ChatPromptTemplate.from_messages(
    [
        article_agent_system_prompt,
        HumanMessage(content="{topic}"), # User's input topic
        MessagesPlaceholder(variable_name="agent_scratchpad"), # For agent's intermediate steps
    ]
)
print("Agent prompt template created.")

# --- Create Agent ---
# Use the LLM bound to the tools, but pass only ACTIONABLE tools (search) to the agent itself
try:
    article_agent = create_tool_calling_agent(
        llm=llm_with_tools,
        tools=search_tools,
        prompt=article_agent_prompt
    )
    print("Tool calling agent created.")
except Exception as e:
     raise RuntimeError(f"Failed to create agent: {e}")


# --- Create Agent Executor ---
# The executor runs the agent loop and uses the actionable tools
article_agent_executor = AgentExecutor(
    agent=article_agent,
    tools=search_tools, # Provide the tools the agent can actively use
    verbose=True, # Print agent thoughts and actions
    handle_parsing_errors=True, # Attempt to recover from LLM format errors
    max_iterations=15, # Limit agent steps to prevent loops
    # return_intermediate_steps=True # Uncomment for deeper debugging if needed
)
print("Agent executor created.")

# --- Output Parser ---
# Used to parse the arguments from the final tool call (ArticleGenerationToolSchema)
pydantic_parser = PydanticToolsParser(tools=[ArticleGenerationToolSchema])
print("Pydantic output parser initialized.")


# --- Core Agent Execution Function ---
async def generate_article_with_search(topic: str) -> Optional[ArticleOutput]:
    """Uses the LangChain Agent Executor to generate article data with verification."""
    print(f"\n[Agent] Starting generation for topic: '{topic}'...")
    final_output_data = None
    response = None # Initialize response variable

    try:
        # Invoke the agent executor asynchronously
        response = await article_agent_executor.ainvoke({"topic": topic})
        print("[Agent] Raw Executor Response:", json.dumps(response, indent=2)) # Pretty print response

        # --- Robust Extraction of Final Tool Call ---
        # Check standard 'output' key first (some executors place final result here)
        if isinstance(response.get("output"), dict) and "title" in response["output"]:
            print("[Agent] Found structured output directly in 'output' key.")
            final_output_data = response["output"]
        # Check 'tool_calls' if available (common for tool_calling_agent)
        elif "tool_calls" in response and response["tool_calls"] and isinstance(response["tool_calls"], list):
            output_call = next((call for call in response["tool_calls"] if call.get("name") == ArticleGenerationToolSchema.__name__), None)
            if output_call:
                print(f"[Agent] Found final tool call in 'tool_calls': {ArticleGenerationToolSchema.__name__}")
                parsed_args_list = pydantic_parser.parse_tool_calls([output_call])
                if parsed_args_list:
                    final_output_data = parsed_args_list[0].args
                else:
                    print("[Agent] Error: PydanticToolsParser failed to parse arguments from tool_calls.")
            else:
                 print("[Agent] Error: Final response 'tool_calls' did not contain the expected output tool call.")
        # Fallback: Check intermediate steps if return_intermediate_steps=True was used
        elif isinstance(response.get("intermediate_steps"), list) and response["intermediate_steps"]:
             print("[Agent] Checking intermediate steps for final output...")
             # Logic to parse intermediate steps would go here (structure varies)
             pass # Add parsing logic if needed

        # If data wasn't found in common locations, check if output is a JSON string
        elif "output" in response and isinstance(response["output"], str):
             print("[Agent] Final output might be a JSON string in 'output', attempting parse...")
             try:
                 potential_data = json.loads(response["output"])
                 if isinstance(potential_data, dict) and "title" in potential_data and "content" in potential_data:
                      final_output_data = potential_data
                 else:
                      print("[Agent] Error: Parsed string output did not match expected structure.")
             except json.JSONDecodeError:
                  print("[Agent] Error: Failed to parse string output as JSON.")

        # --- Validate Extracted Data ---
        if not final_output_data:
            raise AgentProcessingError("Agent finished but failed to extract structured output from the ArticleGenerationToolSchema call.")

        if not isinstance(final_output_data, dict) or not final_output_data.get("title") or not final_output_data.get("content"):
             raise AgentProcessingError(f"Agent final output data is missing title or content. Data: {final_output_data}")

        # --- Create Final Pydantic Object ---
        final_result = ArticleOutput(
            title=final_output_data["title"],
            content=final_output_data["content"],
            sources=final_output_data.get("sources", []) # Handle missing sources field gracefully
        )
        print(f"[Agent] Successfully processed agent output for '{topic}' (Title: '{final_result.title}')")
        return final_result

    except Exception as e:
        print(f"[Agent] CRITICAL Error running agent executor for topic '{topic}': {type(e).__name__}: {e}")
        if hasattr(e, 'args') and e.args: print("[Agent] Exception Args:", e.args)
        if response: print("[Agent] Raw Response on Error:", response) # Log response if available
        return None


# --- Database Interaction ---
async def add_article_to_db(session: AsyncSession, article_data: ArticleOutput):
    """Adds a generated article and its sources to the database."""
    print(f"[DB] Preparing to add article '{article_data.title}'...")
    content_with_sources = article_data.content
    if article_data.sources:
        # Ensure sources are valid strings before joining
        valid_sources = [src for src in article_data.sources if isinstance(src, str)]
        if valid_sources:
             sources_markdown = "\n\n## Sources\n\n" + "\n".join(f"* <{url}>" for url in valid_sources)
             content_with_sources += sources_markdown
             print(f"[DB] Appended {len(valid_sources)} sources to content.")
        else:
             print("[DB] Warning: Sources list found but contained no valid URLs.")

    article_create_input = ArticleCreate(
        title=article_data.title.strip(), # Trim title whitespace
        content=content_with_sources.strip(), # Trim final content whitespace
        comment="AI Generated Initial Content with Sources"
    )
    try:
        await article_crud.create_article_with_revision(
            session=session, article_in=article_create_input, user_id=AI_USER_ID
        )
        print(f"[DB] Successfully added article '{article_data.title}' to database.")
    except Exception as e:
        print(f"[DB] Error adding article '{article_data.title}' to database: {e}")
        await session.rollback() # Rollback this specific transaction


# --- Main Execution Logic ---
async def run_agent_tasks():
    """Runs the generation tasks."""
    # List of topics to generate articles for
    article_topics_to_generate = [
    "The Sons of Africa: Britain's First Pan-African Organization",
    "Ethiopianism: The Religious Roots of Pan-African Thought",
    "The Haitian Revolution's Influence on Pan-African Ideology",
    "W.E.B. Du Bois: Father of Modern Pan-Africanism",
    "Marcus Garvey's Vision for Global Black Unity",
    "Kwame Nkrumah: Architect of African Independence",
    "Edward Blyden: Bridging Africa and the Diaspora",
    "Amy Ashwood Garvey: Pioneer of Pan-African Feminism",
    "The First Pan-African Conference of 1900: Breaking Ground",
    "The Fifth Pan-African Congress: Turning Point in African Independence",
    "The Formation of the Organization of African Unity",
    "The Evolution of the African Union: From OAU to AU",
    "Contemporary Pan-Africanism: Digital Age Activism",
    "The Role of Technology in Modern Pan-African Unity",
    "Pan-African Economic Integration: Successes and Challenges",
    "The Impact of Social Media on Pan-African Identity",
    "Ancient Egyptian Contributions to Pan-African Philosophy",
    "Traditional African Values in Modern Society",
    "The Preservation of African Languages and Dialects",
    "African Cultural Exchange Networks Through History",
    "Decolonizing African Academic Curricula",
    "Pan-African Approaches to STEM Education",
    "African Universities Leading Innovation",
    "Digital Archives of African History and Culture",
    "African Continental Free Trade Area: Implementation Challenges",
    "Historical African Trade Routes and Modern Revival",
    "Pan-African Banking and Financial Systems",
    "Agricultural Cooperatives in African Development",
    "Millennial Perspectives on Pan-Africanism",
    "Young African Leaders Shaping the Continent",
    "Intergenerational Knowledge Transfer in Africa",
    "Future of Pan-African Collaboration and Cooperation",
    "The African Diaspora's Role in Modern Pan-Africanism",
    "Caribbean-African Relations: Past and Present",
    "European-African Cultural Exchange Programs",
    "Asian-African Solidarity Movements",
    "Women Pioneers in Pan-African History",
    "Contemporary Female Leaders in Africa",
    "Gender Equality in African Development",
    "Women's Economic Empowerment Initiatives",
    "Climate Change Impact on African Agriculture",
    "Sustainable Development in African Contexts",
    "Environmental Conservation in Traditional African Societies",
    "Green Technology Innovation in Africa",
    "Traditional African Medicine and Modern Healthcare",
    "Pan-African Health Infrastructure Development",
    "Medical Research Collaboration Across Africa",
    "Telemedicine in Rural African Communities",
    "Artificial Intelligence in African Development",
    "Blockchain Applications in African Economies",
    "Renewable Energy Solutions for Africa",
    "Mobile Technology Transforming African Commerce",
    "Modern African Art Movements",
    "Pan-African Music Festivals and Cultural Exchange",
    "African Film Industry Growth and Impact",
    "Contemporary African Literature and Identity"
];


    print("\n--- Generating Articles with Search Verification ---")
    generation_results = {}
    # Use a single session context for all operations in this run
    async with AsyncSession(async_engine) as session: # Assuming async_engine is imported/available
        for topic in article_topics_to_generate:
            generated_article = await generate_article_with_search(topic)
            if generated_article:
                await add_article_to_db(session, generated_article)
                generation_results[topic] = "Success"
            else:
                generation_results[topic] = "Failed"
            # Adjust sleep time based on API rate limits and agent complexity
            print("-" * 20 + f" Sleeping before next topic... " + "-" * 20)
            await asyncio.sleep(5) # 5-second delay

    print("\n--- Generation Summary ---")
    for topic, result in generation_results.items():
        print(f"- {topic}: {result}")

    print("\nAI Population Agent finished.")


# --- Script Entry Point ---
if __name__ == "__main__":
    print("Starting AI Population Agent with Search...")
    try:
        # Ensure database module can be imported correctly relative to this script
        # (May require adjusting PYTHONPATH or how the script is run if structure is complex)
        from database import async_engine # Import engine here for session context in main
        asyncio.run(run_agent_tasks())
    except ImportError as e:
         print(f"\nError importing project modules: {e}")
         print("Please ensure you run this script from the project's root directory")
         print("and that your virtual environment is activated.")
    except Exception as e:
         print(f"\nAn unexpected error occurred: {e}")