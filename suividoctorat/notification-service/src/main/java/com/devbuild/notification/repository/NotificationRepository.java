package com.devbuild.notification.repository;

import com.devbuild.notification.model.Notification;
import java.util.*;
import java.util.concurrent.atomic.AtomicLong;
import org.springframework.stereotype.Repository;

@Repository
public class NotificationRepository {
    private final Map<Long, Notification> store = new LinkedHashMap<>();
    private final AtomicLong idGen = new AtomicLong(1);

    public Notification save(Notification n) {
        if (n.getId() == null) {
            n.setId(idGen.getAndIncrement());
        }
        store.put(n.getId(), n);
        return n;
    }

    public Optional<Notification> findById(Long id) {
        return Optional.ofNullable(store.get(id));
    }

    public List<Notification> findAll() {
        return new ArrayList<>(store.values());
    }

    public void deleteById(Long id) {
        store.remove(id);
    }
}
