# Data Analytics Pipeline

A comprehensive end-to-end data pipeline that collects real-time website data, processes it through Apache Airflow, stores it in Snowflake, and visualizes it in Metabase dashboards.

## 🔄 Pipeline Overview

This data analytics pipeline follows a complete ETL (Extract, Transform, Load) process from website data collection to business intelligence visualization:

```
Website → Kafka → Airflow → Snowflake → Metabase
```

## 📊 Pipeline Architecture

### 1. **Kafka - Data Collection Layer**

**Purpose**: Real-time data collection from the website

- **How it works**: 
  - The server/backend collects user interactions, events, and activities from the website
  - Data is streamed in real-time to Apache Kafka topics
  - Kafka acts as a distributed message broker, ensuring reliable data ingestion
  - Events are stored in Kafka topics (default: `event` topic) for processing

- **Key Features**:
  - High-throughput, low-latency data streaming
  - Fault-tolerant message storage
  - Scalable distributed architecture
  - Real-time event capture from website activities

- **Data Format**: JSON events containing user interactions, page views, clicks, conversions, and other website activities

### 2. **Apache Airflow - Data Processing Layer**

**Purpose**: Orchestrates the ETL pipeline and processes raw data

Airflow runs three sequential DAGs (Directed Acyclic Graphs) that process data in stages:

#### **polls_dag** (Data Extraction)
- **Schedule**: Runs every minute (`*/1 * * * *`)
- **Function**: 
  - Polls Kafka topic for new messages
  - Consumes events from the Kafka `event` topic
  - Saves raw JSON files to `/opt/airflow/data/raw/`
  - Triggers the next stage upon successful data collection

#### **clean_dag** (Data Transformation)
- **Schedule**: Triggered automatically by `polls_dag`
- **Function**:
  - Reads raw JSON files from the previous stage
  - Cleans and normalizes the data
  - Transforms unstructured JSON into structured format
  - Handles data quality issues (missing values, duplicates, formatting)
  - Saves cleaned CSV files to `/opt/airflow/data/cleaned/`
  - Triggers the final stage for data loading

#### **commit_dag** (Data Loading)
- **Schedule**: Triggered automatically by `clean_dag`
- **Function**:
  - Reads cleaned CSV files
  - Loads processed data into Snowflake data warehouse
  - Ensures data integrity and consistency
  - Updates the Snowflake table (default: `BENE` table in `ANALYTICS.MY_SCHEMA`)

**Airflow Benefits**:
- Automated workflow orchestration
- Error handling and retry mechanisms
- Monitoring and logging capabilities
- Scalable and fault-tolerant processing

### 3. **Snowflake - Data Warehouse Layer**

**Purpose**: Centralized data storage for analytics

- **Storage**: Processed data is stored daily in Snowflake
- **Database**: `ANALYTICS`
- **Schema**: `MY_SCHEMA`
- **Table**: `BENE` (contains the processed event data)
- **Benefits**:
  - Cloud-based data warehouse with unlimited scalability
  - Columnar storage for fast analytical queries
  - Automatic data compression and optimization
  - Secure and compliant data storage
  - Historical data retention for trend analysis

- **Data Flow**: 
  - Cleaned data from Airflow is loaded into Snowflake daily
  - Data accumulates over time, building a comprehensive historical dataset
  - Optimized for analytical queries and reporting

### 4. **Metabase - Business Intelligence Layer**

**Purpose**: Data visualization and business insights

- **Dashboards**: Interactive dashboards for data analysis
- **Key Dashboards**:
  - **Content Preferences Dashboard**: 
    - Analyzes user content preferences and engagement patterns
    - Tracks popular content, user interests, and content performance
    - Helps understand what content resonates with users
  
  - **Conversion Insights Dashboard**:
    - Tracks conversion metrics and funnel analysis
    - Monitors conversion rates, user journeys, and drop-off points
    - Provides insights into what drives conversions
    - Helps optimize marketing and user experience strategies

- **Features**:
  - Self-service analytics for business users
  - Interactive charts and visualizations
  - Real-time data exploration
  - Scheduled reports and alerts
  - SQL query interface for advanced analysis

## 🔄 Complete Data Flow

```
┌─────────┐
│ Website │  User interactions, events, activities
└────┬────┘
     │
     ▼
┌─────────┐
│  Kafka  │  Real-time data streaming & storage
│  Topic  │  (event topic)
└────┬────┘
     │
     ▼
┌─────────────────────────────────────────┐
│         Apache Airflow                  │
│  ┌──────────┐  ┌──────────┐  ┌──────┐ │
│  │polls_dag │→ │clean_dag │→ │commit│ │
│  │(Extract) │  │(Transform)│  │_dag  │ │
│  │          │  │          │  │(Load)│ │
│  └──────────┘  └──────────┘  └──────┘ │
└─────────────────────────────────────────┘
     │
     ▼
┌──────────┐
│Snowflake │  Daily data storage
│ Database │  (ANALYTICS.MY_SCHEMA.BENE)
└────┬─────┘
     │
     ▼
┌──────────┐
│ Metabase │  Dashboards & Analytics
│          │  • Content Preferences
│          │  • Conversion Insights
└──────────┘
```

## 📈 Data Processing Schedule

- **Kafka**: Continuous real-time data collection
- **Airflow polls_dag**: Every 1 minute
- **Airflow clean_dag**: Triggered by polls_dag (typically every 1 minute)
- **Airflow commit_dag**: Triggered by clean_dag (typically every 1 minute)
- **Snowflake**: Daily data accumulation
- **Metabase**: Real-time dashboard updates (refreshes based on Snowflake data)

## 🛠️ Technology Stack

| Component | Technology | Purpose |
|------------|-----------|---------|
| **Data Collection** | Apache Kafka | Real-time event streaming |
| **Orchestration** | Apache Airflow 3.1.3 | Workflow management |
| **Data Warehouse** | Snowflake | Cloud data storage |
| **BI & Analytics** | Metabase | Data visualization |
| **Containerization** | Docker & Docker Compose | Deployment |
| **Database** | PostgreSQL | Airflow metadata |
| **Message Broker** | Redis | Celery task queue |

## 📁 Project Structure

```
Data Analytics/
├── dags/                      # Airflow DAG definitions
│   ├── polls_dag.py          # Kafka polling DAG
│   ├── clean_dag.py          # Data cleaning DAG
│   ├── commit_dag.py         # Snowflake loading DAG
│   ├── config.py             # Configuration
│   └── utils/                # Utility modules
├── scripts/                   # Helper scripts
│   └── kafka/                # Kafka utilities
├── config/                    # Configuration files
│   ├── airflow.cfg           # Airflow settings
│   └── kafka/                # Kafka configuration
├── data/                      # Data directories
│   ├── raw/                  # Raw JSON from Kafka
│   └── cleaned/              # Processed CSV files
├── docker-compose.yaml        # Docker setup
├── requirements.txt          # Python dependencies
└── README.md                 # This file
```

## 🔧 Configuration

### Kafka Configuration
- **Topic**: `event` (default)
- **Consumer Group**: `airflow-consumer-group`
- **Security**: SASL_SSL with authentication
- **Configuration File**: `config/kafka/client.properties`

### Airflow Configuration
- **Executor**: CeleryExecutor
- **Database**: PostgreSQL
- **Broker**: Redis
- **DAGs Location**: `dags/`
- **Data Directories**: `data/raw/` and `data/cleaned/`

### Snowflake Configuration
- **Database**: `ANALYTICS`
- **Schema**: `MY_SCHEMA`
- **Table**: `BENE`
- **Connection**: Configured in Airflow UI (Admin → Connections)
- **Connection ID**: `snowflake_conn` (default)

### Metabase Configuration
- **Data Source**: Snowflake connection
- **Database**: `ANALYTICS`
- **Dashboards**: 
  - Content Preferences & Conversion Insights
  - Custom dashboards as needed

## 📊 Key Metrics & Insights

### Content Preferences Dashboard
- User engagement by content type
- Popular content analysis
- Content performance metrics
- User preference trends
- Content recommendation insights

### Conversion Insights Dashboard
- Conversion funnel analysis
- Conversion rate trends
- User journey mapping
- Drop-off point identification
- Conversion optimization opportunities
- ROI and performance metrics

## 🚀 Getting Started

1. **Prerequisites**:
   - Docker and Docker Compose
   - Kafka cluster access
   - Snowflake account
   - Metabase instance

2. **Setup**:
   ```bash
   # Configure environment variables
   cp .env.example .env
   # Edit .env with your credentials
   
   # Start services
   docker-compose up -d
   ```

3. **Access**:
   - Airflow UI: http://localhost:8080
   - Metabase: [Your Metabase URL]

## 📝 Data Flow Summary

1. **Website** generates user events and interactions
2. **Kafka** collects and stores events in real-time
3. **Airflow polls_dag** extracts events from Kafka every minute
4. **Airflow clean_dag** transforms and cleans the data
5. **Airflow commit_dag** loads cleaned data to Snowflake
6. **Snowflake** stores data daily for historical analysis
7. **Metabase** connects to Snowflake and displays dashboards:
   - Content Preferences Dashboard
   - Conversion Insights Dashboard

## 🔍 Monitoring

- **Airflow UI**: Monitor DAG runs, task status, and logs
- **Kafka**: Monitor topic consumption and lag
- **Snowflake**: Query execution and storage metrics
- **Metabase**: Dashboard performance and query execution

## 📚 Additional Documentation

- [DAGs Documentation](dags/README.md): Detailed DAG documentation
- [Kafka Scripts](scripts/kafka/README.md): Kafka utilities guide
- [GCP Deployment Plan](GCP_DEPLOYMENT_PLAN.md): Cloud deployment guide
- [Deployment Steps](DEPLOYMENT_STEPS.md): Deployment instructions

## 🎯 Business Value

This pipeline enables:
- **Real-time Data Collection**: Capture website events as they happen
- **Automated Processing**: No manual intervention required
- **Scalable Architecture**: Handles growing data volumes
- **Historical Analysis**: Long-term data retention in Snowflake
- **Business Insights**: Actionable dashboards for decision-making
- **Content Optimization**: Understand what content performs best
- **Conversion Optimization**: Identify and improve conversion opportunities

---

**Note**: This pipeline is designed for production use with proper monitoring, error handling, and scalability considerations.

