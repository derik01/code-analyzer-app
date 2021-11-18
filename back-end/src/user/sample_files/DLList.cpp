/*
 * Author:      Alexander Born
 * Course:      Fall 2020 CSCE 221 502
 * Date:        2020-10-06
 * Assignment:  PA2
 */

#include "DLList.h"
#include <ostream>
#include <exception>

// Exception from notes
struct EmptyDLinkedListException : std::logic_error {

  EmptyDLinkedListException()
    : std::logic_error("Empty Double Linked List") 
  { }

};

struct MutatedOutOfBounds : std::out_of_range {
  MutatedOutOfBounds() 
    : std::out_of_range("Attempted to mutate node which is out of bounds.")
  { };
};

DLList::DLList() {
  header.next = &trailer;
  trailer.prev = &header;
}

/*
  Copies a chain of heap nodes
  Returns the last nodes in the chain

  Last node next pointer remains null
  First node prev pointer is unset
*/
DLListNode * realloc_heap_nodes(const DLListNode * src, DLListNode * dst){

  const DLListNode* cursor = src->next;

  while((cursor = cursor->next) != nullptr){
    DLListNode * n = new DLListNode(cursor->prev->obj, dst);
    dst->next = n;
    dst = dst->next; 
  }

  return dst;
}

void del_heap_nodes(const DLListNode * src){
  const DLListNode * cursor = src->next;

  // Delete all heap allocated nodes
  while((cursor = cursor->next) != nullptr)
    delete cursor->prev;
}

DLList::~DLList() {
  del_heap_nodes(&header);
}

DLList::DLList(const DLList & dll){
  trailer.prev = realloc_heap_nodes(&dll.header, &header);
  trailer.prev->next = &trailer;
}

DLList & DLList::operator=(const DLList& dll){
  del_heap_nodes(&header);

  trailer.prev = realloc_heap_nodes(&dll.header, &header);
  trailer.prev->next = &trailer;

  return *this;
}

// Move macro
// src: source list object (reference)
// dst: destination list pointer
#define MOVE_DLL_CONTENT(src, dst) {          \
  if(!src.is_empty()){                        \
    dst->header = src.header;                 \
    dst->trailer = src.trailer;               \
                                              \
    /* Rewire stack pointers */               \
    dst->header.next->prev = &dst->header;    \
    dst->trailer.prev->next = &dst->trailer;  \
                                              \
    /* Husk old object */                     \
    src.header.next = &src.trailer;           \
    src.trailer.prev = &src.header;           \
  }else {                                     \
    /* 
     * construct to avoid wiring 
     * destination head to source tail
     * during reassignment 
     *
    */                                        \
    dst->header.next = &dst->trailer;         \
    dst->trailer.prev = &dst->header;         \
  }                                           \
}

DLList::DLList(DLList&& dll){
  MOVE_DLL_CONTENT(dll, this);
}

DLList & DLList::operator=(DLList && dll) {
  if(&dll != this){
    del_heap_nodes(&header);

    MOVE_DLL_CONTENT(dll, this);
  }

  return *this;
}

DLListNode * DLList::first_node() const { return header.next; }

const DLListNode * DLList::after_last_node() const { return &trailer; }

int DLList::first() const { 
  if(is_empty())
    throw EmptyDLinkedListException();

  return header.next->obj;
}

int DLList::last() const {
  if(is_empty())
    throw EmptyDLinkedListException();

  return trailer.prev->obj;
}

bool DLList::is_empty() const { return header.next == &trailer; }

/* Removal */

// Helper
int remove_node(DLListNode *r){
  int obj = r->obj;

  // Rewire pointers
  r->prev->next = r->next;
  r->next->prev = r->prev;
  delete r;

  return obj;
}

int DLList::remove_after(DLListNode &p){
  if(is_empty())
    throw EmptyDLinkedListException();
  else if(&p == &trailer || p.next == &trailer)
    throw MutatedOutOfBounds();
  
  return remove_node(p.next);
}

// Should be const to permit removal of the last node from trailer
int DLList::remove_before(DLListNode &p){
  if(is_empty())
    throw EmptyDLinkedListException();
  else if(&p == &header || p.prev == &header)
    throw MutatedOutOfBounds();

  return remove_node(p.prev); 
}

int DLList::remove_first() { return remove_after(header); }

int DLList::remove_last() { return remove_before(trailer); }

/* Insertion */

// Helper
void insert_node(DLListNode *at, int new_obj){
  DLListNode *n = new DLListNode(new_obj, at, at->next);
  n->prev->next = n;
  n->next->prev = n;
}

void DLList::insert_after(DLListNode &p, int obj){
  insert_node(&p, obj); 
}

void DLList::insert_before(DLListNode &p, int obj){
  insert_node(p.prev, obj);
}

void DLList::insert_last(int obj){
  insert_before(trailer, obj);
}

void DLList::insert_first(int obj){
  insert_after(header, obj);
}

std::ostream & operator<<(std::ostream & stream, const DLList & dll){
  const DLListNode * cursor = dll.first_node();

  while((cursor = cursor->next) != nullptr)
    stream << cursor->prev->obj << ", ";

  return stream;
}
