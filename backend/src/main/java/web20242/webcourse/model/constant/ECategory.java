package web20242.webcourse.model.constant;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum ECategory {
    POPULAR,
    DEVELOPMENT,
    BUSINESS,
    ACCOUNTING,
    FINANCE,
    DESIGN,
    IT,
    MARKETING,
    MUSIC,
    PHOTOGRAPHY;
    @JsonCreator
    public static ECategory fromString(String value) {
        return ECategory.valueOf(value.toUpperCase());
    }
}

