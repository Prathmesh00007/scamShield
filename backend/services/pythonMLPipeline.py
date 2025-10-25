#!/usr/bin/env python3

"""
Advanced ML Pipeline for Scam Detection & Trend Analysis
Integrated with Node.js backend for real-time processing
"""

import os
import sys
import json
import subprocess
from datetime import datetime, timedelta
from dateutil import parser as dateparser
import numpy as np
import pandas as pd

# ML Libraries
from transformers import pipeline
from sentence_transformers import SentenceTransformer
from bertopic import BERTopic
import warnings
warnings.filterwarnings("ignore")

# =========================
# 1) Hierarchical Taxonomy
# =========================

PARENT_CATEGORIES = [
    "identity and account scams",
    "financial and payment scams",
    "commerce and delivery scams",
    "employment and education scams",
    "lottery prize and reward scams",
    "investment and trading scams",
    "romance and social scams",
    "tech support and service scams",
    "online content and social media scams",
    "banking and institutional scams",
]

TAXONOMY = {
    "identity and account scams": [
        "KYC update scam",
        "Aadhaar/PAN verification scam",
        "bank account suspension scam",
        "credit card block scam",
        "SIM swap scam",
        "OTP phishing scam",
        "account recovery scam",
        "fake 2FA verification scam",
        "identity theft scam",
        "fake government ID renewal scam",
    ],
    "financial and payment scams": [
        "UPI fraud",
        "ATM card skimming scam",
        "loan approval scam",
        "fake EMI relief scam",
        "credit score improvement scam",
        "debt settlement scam",
        "fake insurance claim scam",
        "pension withdrawal scam",
        "fake subsidy scheme scam",
        "tax refund scam",
    ],
    "commerce and delivery scams": [
        "fake courier delivery scam",
        "parcel held at customs scam",
        "e-commerce refund scam",
        "fake product listing scam",
        "online marketplace overpayment scam",
        "return replacement fraud",
        "fake warranty scam",
        "subscription renewal scam",
        "fake invoice scam",
        "QR code payment scam",
    ],
    "employment and education scams": [
        "fake job offer scam",
        "work-from-home scam",
        "data entry scam",
        "online tutoring scam",
        "internship scam",
        "fake recruitment agency scam",
        "training fee scam",
        "scholarship scam",
        "exam paper leak scam",
        "fake certificate scam",
    ],
    "lottery prize and reward scams": [
        "lottery win scam",
        "lucky draw scam",
        "free gift scam",
        "cashback scam",
        "fake coupon scam",
        "festival prize scam",
        "social media giveaway scam",
        "fake survey reward scam",
        "spin-the-wheel scam",
        "fake airline ticket prize scam",
    ],
    "investment and trading scams": [
        "crypto investment scam",
        "Ponzi scheme",
        "MLM scam",
        "fake stock trading platform scam",
        "forex trading scam",
        "binary options scam",
        "NFT rug pull scam",
        "fake mutual fund scam",
        "gold investment scam",
        "real estate investment scam",
    ],
    "romance and social scams": [
        "romance scam",
        "matrimonial scam",
        "dating app scam",
        "fake friendship scam",
        "sextortion scam",
        "fake charity scam",
        "disaster relief scam",
        "NGO donation scam",
        "religious offering scam",
        "fake crowdfunding scam",
    ],
    "tech support and service scams": [
        "fake tech support scam",
        "remote access scam",
        "antivirus renewal scam",
        "fake Microsoft Apple support scam",
        "fake telecom operator scam",
        "broadband upgrade scam",
        "streaming subscription scam",
        "fake recharge offer scam",
        "cloud storage scam",
        "fake app download scam",
    ],
    "online content and social media scams": [
        "fake influencer scam",
        "fake brand collaboration scam",
        "social media impersonation scam",
        "fake follower scam",
        "fake verification badge scam",
        "phishing via shortened links",
        "fake news scam",
        "deepfake scam",
        "fake review scam",
        "fake event ticket scam",
    ],
    "banking and institutional scams": [
        "fake RBI SEBI notice scam",
        "fake bank manager call scam",
        "fake police cyber cell call scam",
        "fake court legal notice scam",
        "fake electricity bill scam",
        "fake water bill scam",
        "fake gas subsidy scam",
        "fake health insurance scam",
        "fake hospital medical bill scam",
        "fake NGO charity fund scam",
    ],
}

SUMMARY_TEMPLATES = {
    "fake courier delivery scam": "Victims get delivery texts urging a small 're-delivery fee' via link, stealing payment details.",
    "KYC update scam": "Urgent messages claim KYC/PAN will be blocked; link leads to phishing page harvesting credentials.",
    "fake job offer scam": "High-paying jobs promised; victims asked to pay 'training' or 'unlock task' fees and lose money.",
    "lottery win scam": "Messages claim a prize win; victims pay 'processing fees' or share sensitive details.",
    "crypto investment scam": "Fraudulent platforms show fake returns, then block withdrawals after larger deposits.",
    "UPI fraud": "Fraudsters trick victims into sharing UPI PIN or making payments through fake UPI links.",
    "romance scam": "Scammers build fake relationships online, then ask for money for emergencies or travel.",
    "fake tech support scam": "Pop-up warnings claim computer is infected; victims call fake support and pay for 'repairs'.",
}

class AdvancedMLPipeline:
    def __init__(self):
        self.zshot = None
        self.summarizer = None
        self.embedder = None
        self.topic_model = None
        self.models_loaded = False
        
    def load_models(self):
        """Load ML models (cached after first load)"""
        if self.models_loaded:
            return
            
        print("Loading ML models...")
        try:
            # Load models
            self.zshot = pipeline("zero-shot-classification", model="roberta-large-mnli")
            self.summarizer = pipeline("summarization", model="facebook/bart-large-cnn")
            self.embedder = SentenceTransformer("all-mpnet-base-v2")
            self.topic_model = BERTopic(verbose=False)
            self.models_loaded = True
            print("Models loaded successfully!")
        except Exception as e:
            print(f"Error loading models: {e}")
            raise

    def parse_timestamp(self, ts):
        try:
            return dateparser.parse(ts)
        except Exception:
            return None

    def safe_summary(self, text, max_len=40, min_len=12):
        if not text or not text.strip():
            return ""
        if len(text.split()) < 12:
            return text.strip()
        try:
            out = self.summarizer(text, max_length=max_len, min_length=min_len, do_sample=False)
            return out[0]["summary_text"].strip()
        except Exception:
            return text[:200].strip()

    def hierarchical_zero_shot(self, text):
        """Hierarchical classification: parent -> child"""
        if not text or not text.strip():
            return None, None, 0.0, 0.0

        # Parent prediction
        parent_result = self.zshot(text, PARENT_CATEGORIES, multi_label=False)
        parent_label = parent_result["labels"][0]
        parent_score = parent_result["scores"][0]

        # Child prediction within parent
        child_labels = TAXONOMY.get(parent_label, [])
        if not child_labels:
            return parent_label, None, parent_score, 0.0

        child_result = self.zshot(text, child_labels, multi_label=False)
        child_label = child_result["labels"][0]
        child_score = child_result["scores"][0]

        return parent_label, child_label, float(parent_score), float(child_score)

    def label_template_summary(self, child_label, text):
        tmpl = SUMMARY_TEMPLATES.get(child_label)
        if tmpl:
            return tmpl
        return self.safe_summary(text)

    def process_incidents(self, incidents_data):
        """Process incidents from Node.js backend"""
        if not incidents_data:
            return {"error": "No incidents provided"}
            
        try:
            # Convert to DataFrame
            df = pd.DataFrame(incidents_data)
            
            if "text" not in df.columns:
                # Combine title and description
                df["text"] = (df.get("title", "") + " " + df.get("description", "")).str.strip()
            
            if "timestamp" not in df.columns:
                df["timestamp"] = datetime.utcnow().isoformat()
            
            if "id" not in df.columns:
                df["id"] = df.get("_id", range(len(df)))
            
            # Parse timestamps
            df["ts"] = df["timestamp"].apply(self.parse_timestamp)
            
            texts = df["text"].fillna("").tolist()
            
            # Load models if not loaded
            self.load_models()
            
            # Hierarchical classification + summaries
            parents, children, p_scores, c_scores, summaries = [], [], [], [], []
            
            for text in texts:
                parent, child, ps, cs = self.hierarchical_zero_shot(text)
                parents.append(parent or "")
                children.append(child or "")
                p_scores.append(ps)
                c_scores.append(cs)
                summaries.append(self.label_template_summary(child, text))
            
            df["parent_category"] = parents
            df["child_label"] = children
            df["parent_confidence"] = p_scores
            df["child_confidence"] = c_scores
            df["summary"] = summaries
            
            # Embeddings + BERTopic clustering
            print("Generating embeddings and clustering...")
            embeddings = self.embedder.encode(texts, show_progress_bar=True)
            topics, probs = self.topic_model.fit_transform(texts, embeddings)
            df["topic_id"] = topics
            
            # Topic info
            topic_info = self.topic_model.get_topic_info()
            topic_names = {}
            for _, row in topic_info.iterrows():
                t_id = row["Topic"]
                name = row.get("Name", f"Topic {t_id}")
                topic_names[t_id] = name
            
            df["topic_name"] = df["topic_id"].map(topic_names)
            
            # Trend detection
            df["week"] = df["ts"].apply(lambda d: d.isocalendar()[1] if d else None)
            weekly_counts = df.groupby(["week", "topic_id"]).size().reset_index(name="count")
            
            # Compute trends
            trend_rows = []
            for t_id in sorted(df["topic_id"].unique()):
                topic_week = weekly_counts[weekly_counts["topic_id"] == t_id].sort_values("week")
                if len(topic_week) < 2:
                    continue
                last = topic_week.iloc[-1]["count"]
                prev = topic_week.iloc[-2]["count"]
                if prev > 0:
                    pct_change = (last - prev) / prev * 100.0
                else:
                    pct_change = 100.0 if last > 0 else 0.0
                trend_rows.append({
                    "topic_id": t_id,
                    "topic_name": topic_names.get(t_id, f"Topic {t_id}"),
                    "last_week_count": int(last),
                    "prev_week_count": int(prev),
                    "percent_change": round(pct_change, 2),
                })
            
            trend_df = pd.DataFrame(trend_rows).sort_values(
                ["percent_change", "last_week_count"], ascending=[False, False]
            )
            
            # Prepare output
            output_data = []
            for _, row in df.iterrows():
                output_data.append({
                    "id": str(row["id"]),
                    "text": row["text"],
                    "parent_category": row["parent_category"],
                    "child_label": row["child_label"],
                    "parent_confidence": float(row["parent_confidence"]),
                    "child_confidence": float(row["child_confidence"]),
                    "summary": row["summary"],
                    "topic_id": int(row["topic_id"]),
                    "topic_name": row["topic_name"],
                    "timestamp": row["timestamp"],
                    "region": row.get("location", ""),
                })
            
            return {
                "success": True,
                "processed_incidents": len(output_data),
                "incidents": output_data,
                "trending_topics": trend_df.head(10).to_dict("records"),
                "total_patterns": len(trend_df),
                "analysis_timestamp": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            return {"error": f"Processing failed: {str(e)}"}

def main():
    """Main entry point for command line usage"""
    print("🐍 Python ML Pipeline started", file=sys.stderr)
    print(f"🐍 Arguments received: {len(sys.argv)}", file=sys.stderr)
    
    try:
        # ✅ NEW: Check if data is coming from stdin or command line
        if len(sys.argv) >= 2:
            # Command line argument (backward compatibility)
            print("🐍 Reading from command line argument", file=sys.stderr)
            input_data = json.loads(sys.argv[1])
        else:
            # Read from stdin (preferred for large data)
            print("🐍 Reading from stdin...", file=sys.stderr)
            input_json = sys.stdin.read()
            
            if not input_json.strip():
                error_result = {"error": "No input data received from stdin"}
                print(json.dumps(error_result, indent=2))
                sys.exit(1)
            
            print(f"🐍 Received {len(input_json)} bytes from stdin", file=sys.stderr)
            input_data = json.loads(input_json)
        
        print(f"🐍 Parsed {len(input_data)} incidents", file=sys.stderr)
        
        print("🐍 Creating ML pipeline...", file=sys.stderr)
        pipeline = AdvancedMLPipeline()
        
        print("🐍 Processing incidents...", file=sys.stderr)
        result = pipeline.process_incidents(input_data)
        
        print("🐍 Pipeline completed successfully", file=sys.stderr)
        # Output JSON result to stdout
        print(json.dumps(result, indent=2))
        
    except json.JSONDecodeError as e:
        error_result = {"error": f"JSON parsing failed: {str(e)}"}
        print(json.dumps(error_result, indent=2), file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        error_result = {"error": f"Pipeline failed: {str(e)}"}
        print(json.dumps(error_result, indent=2), file=sys.stderr)
        print(f"🐍 Exception details: {traceback.format_exc()}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
