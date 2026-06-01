#include <stdio.h>
#include <stdlib.h>
#include <string.h>

/**
 * @struct WeatherNode
 * @brief Represents a single node in the weather data linked list.
 */
typedef struct WeatherNode {
    char district[50];
    float temperature;
    int humidity;
    char condition[30];
    struct WeatherNode* next;
} WeatherNode;

/**
 * @brief Creates a new WeatherNode.
 * @return Pointer to the newly created node.
 */
WeatherNode* create_node(const char* dist, float temp, int hum, const char* cond) {
    WeatherNode* newNode = (WeatherNode*)malloc(sizeof(WeatherNode));
    if (newNode == NULL) {
        fprintf(stderr, "Memory allocation error\n");
        return NULL;
    }
    strncpy(newNode->district, dist, 49);
    newNode->temperature = temp;
    newNode->humidity = hum;
    strncpy(newNode->condition, cond, 29);
    newNode->next = NULL;
    return newNode;
}

/**
 * @brief Inserts a node at the end of the list.
 */
void insert_end(WeatherNode** head, const char* dist, float temp, int hum, const char* cond) {
    WeatherNode* newNode = create_node(dist, temp, hum, cond);
    if (*head == NULL) {
        *head = newNode;
        return;
    }
    WeatherNode* temp_ptr = *head;
    while (temp_ptr->next != NULL) {
        temp_ptr = temp_ptr->next;
    }
    temp_ptr->next = newNode;
}

/**
 * @brief Displays all weather data in the list.
 */
void display_weather_list(WeatherNode* head) {
    printf("\n============================================================\n");
    printf("| %-15s | %-10s | %-10s | %-15s |\n", "District", "Temp(C)", "Humidity", "Condition");
    printf("============================================================\n");
    
    WeatherNode* current = head;
    while (current != NULL) {
        printf("| %-15s | %-10.2f | %-10d | %-15s |\n", 
               current->district, current->temperature, current->humidity, current->condition);
        current = current->next;
    }
    printf("============================================================\n");
}

/**
 * @brief Searches for weather data of a specific district.
 */
WeatherNode* search_district(WeatherNode* head, const char* dist) {
    WeatherNode* current = head;
    while (current != NULL) {
        if (strcmp(current->district, dist) == 0) {
            return current;
        }
        current = current->next;
    }
    return NULL;
}

/**
 * @brief Frees the entire linked list.
 */
void free_list(WeatherNode* head) {
    WeatherNode* temp;
    while (head != NULL) {
        temp = head;
        head = head->next;
        free(temp);
    }
}

int main() {
    WeatherNode* head = NULL;

    // Adding sample data for Tamil Nadu districts
    insert_end(&head, "Chennai", 32.5, 78, "Humid");
    insert_end(&head, "Coimbatore", 28.0, 55, "Cloudy");
    insert_end(&head, "Madurai", 35.2, 45, "Sunny");
    insert_end(&head, "Trichy", 33.8, 50, "Clear");
    insert_end(&head, "Salem", 31.5, 60, "Partly Cloudy");

    printf("TN Weather Analytics - Data Structure Module\n");
    display_weather_list(head);

    // Searching example
    const char* search_key = "Madurai";
    printf("\nSearching for: %s...\n", search_key);
    WeatherNode* result = search_district(head, search_key);
    if (result) {
        printf("Record Found! Temperature in %s is %.2f C\n", result->district, result->temperature);
    } else {
        printf("Record not found.\n");
    }

    // Cleanup
    free_list(head);
    printf("\nMemory freed. Exiting...\n");

    return 0;
}
