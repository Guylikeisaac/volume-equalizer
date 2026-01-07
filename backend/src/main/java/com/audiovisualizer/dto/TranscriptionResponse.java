package com.audiovisualizer.dto;

public class TranscriptionResponse {
    
    private String type;
    private String text;
    private boolean isFinal;
    private long timestamp;

    public TranscriptionResponse() {
        this.timestamp = System.currentTimeMillis();
    }

    public TranscriptionResponse(String type, String text, boolean isFinal) {
        this.type = type;
        this.text = text;
        this.isFinal = isFinal;
        this.timestamp = System.currentTimeMillis();
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }

    public boolean isFinal() {
        return isFinal;
    }

    public void setFinal(boolean isFinal) {
        this.isFinal = isFinal;
    }

    public long getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(long timestamp) {
        this.timestamp = timestamp;
    }
}
