#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define MAX_STACK 100

/**
 * @struct WeatherStack
 * @brief Simple stack implementation to store district names.
 * Useful for 'Back' functionality or undoing selections.
 */
typedef struct {
    char items[MAX_STACK][50];
    int top;
} WeatherStack;

void init_stack(WeatherStack* s) {
    s->top = -1;
}

int is_full(WeatherStack* s) {
    return s->top == MAX_STACK - 1;
}

int is_empty(WeatherStack* s) {
    return s->top == -1;
}

void push(WeatherStack* s, const char* district) {
    if (is_full(s)) {
        printf("Stack Overflow!\n");
        return;
    }
    strcpy(s->items[++(s->top)], district);
    printf("Pushed: %s\n", district);
}

char* pop(WeatherStack* s) {
    if (is_empty(s)) {
        printf("Stack Underflow!\n");
        return NULL;
    }
    return s->items[(s->top)--];
}

char* peek(WeatherStack* s) {
    if (is_empty(s)) return NULL;
    return s->items[s->top];
}

int main() {
    WeatherStack history;
    init_stack(&history);

    printf("--- Weather Selection History (Stack Concept) ---\n");
    
    push(&history, "Chennai");
    push(&history, "Coimbatore");
    push(&history, "Madurai");

    printf("\nCurrent Selection (Peek): %s\n", peek(&history));

    printf("\nPopping history:\n");
    while (!is_empty(&history)) {
        printf("Going back from: %s\n", pop(&history));
    }

    return 0;
}
