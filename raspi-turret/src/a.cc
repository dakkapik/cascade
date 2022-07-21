#include <iostream>
#include <string>

int main(){
    std::string test;
    while(true) {
        std::cin >> test;
        std::cout << "item: " << test << "was processed\n";
    }
}