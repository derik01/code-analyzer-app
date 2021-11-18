// test of the DLList class

#include <iostream>
#include <cstdlib>
#include "DLList.h"

using namespace std;

int main ()
{
  // Construct a linked list with header & trailer
  cout << "Create a new list" << endl;
  DLList dll;
  cout << "list: " << dll << endl << endl;
  
  cout << "Insert 10 nodes at back with value 10,20,30,..,100" << endl;
  for (int i=10; i <= 100; i+=10) {
    dll.insert_last(i);
  }
  cout << "list: " << dll << endl << endl;

  cout << "Insert 10 nodes at front with value 10,20,30,..,100" << endl;
  for (int i=10; i <= 100; i+=10) {
    dll.insert_first(i);
  }
  cout << "list: " << dll << endl << endl;
  
  cout << "Copy to a new list" << endl;
  DLList dll2(dll);
  cout << "list2: " << dll2 << endl << endl;
  
  cout << "Assign to another new list" << endl;
  DLList dll3;
  dll3 = dll;
  cout << "list3: " << dll3 << endl << endl;
  
  cout << "Delete the last 10 nodes" << endl;
  for (int i=0; i < 10; i++) {
    dll.remove_last();
  }
  cout << "list: " << dll << endl << endl;
  
  cout << "Delete the first 10 nodes" << endl;
  for (int i=0; i < 10; i++) {
    dll.remove_first();
  }
  cout << "list: " << dll << endl << endl;
  
  // Check the other two lists
  cout << "Make sure the other two lists are not affected." << endl;
  cout << "list2: " << dll2 << endl;
  cout << "list3: " << dll3 << endl << endl;

  // more testing...
  // add tests for insert_after, insert_before
  cout << "Insert 10 nodes at back with value 10,20,30,..,100" << endl;
  for (int i=10; i <= 100; i+=10) {
    dll.insert_last(i);
  }
  cout << "list: " << dll << endl << endl;

  // Get reference for testing
  DLListNode *curr = dll.first_node();
  while (curr->obj != 50) {
    curr = curr->next;
  }
  DLListNode& ref = *curr;

  // Insert before
  cout << "Insert 41-49 before 50" << endl;
  for (int i = 41; i < 50; ++i) {
    dll.insert_before(ref, i);
  }
  cout << dll << endl << endl;

  // Insert after
  cout << "Insert 59-51 after 50" << endl;
  for (int i = 59; i > 50; --i) {
    dll.insert_after(ref, i);
  }
  cout << dll << endl << endl;

  // add tests for remove_after, remove_before
  
  // Remove after
  cout << "Remove 9 after 50" << endl;
  for (int i = 0; i < 9; i++) {
    dll.remove_after(ref);
  }
  cout << dll << endl << endl;

  // Remove before
  cout << "Remove 9 before 50" << endl;
  for (int i = 0; i < 9; i++) {
    dll.remove_before(ref);
  }
  cout << dll << endl << endl;

  // Test move constuctor / assignment
  DLList origDll;
  for (int i=10; i <= 100; i+=10) {
    origDll.insert_last(i);
  }
  
  DLList moveDll(move(origDll));
  dll2 = move(origDll);

  return 0;
}
