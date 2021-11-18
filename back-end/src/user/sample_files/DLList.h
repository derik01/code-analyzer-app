/*
 * Author:      Alexander Born
 * Course:      Fall 2020 CSCE 221 502
 * Date:        2020-10-06
 * Assignment:  PA2
 */

#ifndef DLLIST_H
#define DLLIST_H

#include <iostream>

using namespace std;

class DLList; // class declaration

// doubly linked list node
struct DLListNode {
  int obj;
  DLListNode *prev, *next;
  // constructor
    DLListNode(int e=0, DLListNode *p=nullptr, DLListNode *n=nullptr): obj(e), prev(p), next(n){}
};

// doubly linked list class
class DLList {
private:
  DLListNode header, trailer;
public:
  DLList();
  DLList(const DLList& dll); // copy constructor
  DLList(DLList&& dll); // move constructor
  ~DLList(); // destructor
  DLList& operator=(const DLList& dll); // copy assignment operator
  DLList& operator=(DLList&& dll); // move assignment operator
  // return the pointer to the first node (header's next)
  DLListNode *first_node() const;
  // return the pointer to the trailer
  const DLListNode *after_last_node() const;
  // return if the list is empty
  bool is_empty() const;
  int first() const; // return the first object
  int last() const; // return the last object
  void insert_first(int obj); // insert to the first node
  int remove_first(); // remove the first node
  void insert_last(int obj); // insert to the last node
  int remove_last(); // remove the last node
  void insert_after(DLListNode &p, int obj);
  void insert_before(DLListNode &p, int obj);
  int remove_after(DLListNode &p);
  int remove_before(DLListNode &p);
};

// output operator
ostream& operator<<(ostream& out, const DLList& dll);

#endif
