package com.example.sample.common;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.NoSuchElementException;

@Component
public class MessageHandler {

    private static final Logger log = LoggerFactory.getLogger(MessageHandler.class);

    public NoSuchElementException notFound(String entity, Object id) {
        String msg = entity + " not found. id=" + id;
        log.warn(msg);
        return new NoSuchElementException(msg);
    }

    public IllegalArgumentException badRequest(String message) {
        log.warn("Bad request: {}", message);
        return new IllegalArgumentException(message);
    }

    public String format(String template, Object... args) {
        return String.format(template, args);
    }
}
